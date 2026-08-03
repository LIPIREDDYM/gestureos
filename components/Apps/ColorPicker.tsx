"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Plus, Trash2, Check } from "lucide-react";

function hslToRgb(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function toHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

const INITIAL_PALETTE = [
  { h: 214, s: 100, l: 52 }, // accent-blue
  { h: 280, s: 85, l: 60 },  // accent-purple
  { h: 348, s: 100, l: 60 }, // accent-pink
  { h: 142, s: 71, l: 50 },  // accent-green
];

export function ColorPicker() {
  const [h, setH] = useState(214);
  const [s, setS] = useState(100);
  const [l, setL] = useState(52);
  const [palette, setPalette] = useState(INITIAL_PALETTE);
  const [copied, setCopied] = useState<string | null>(null);

  const [r, g, b] = hslToRgb(h, s, l);
  const hex = toHex(r, g, b);
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
  const rgbStr = `rgb(${r}, ${g}, ${b})`;

  const copy = (val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopied(val);
    setTimeout(() => setCopied(null), 1500);
  };

  const addToPalette = () => {
    setPalette(p => [...p.slice(-15), { h, s, l }]);
  };

  // Gradient pickers
  const hueBg = `linear-gradient(to right, hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))`;
  const satBg = `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`;
  const lightBg = `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`;

  const Slider = ({ label, value, min, max, onChange, bg }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; bg: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] text-white/40">
        <span>{label}</span><span className="tabular-nums">{value}</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: bg }}>
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
        <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white shadow-lg"
          style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 10px)`, background: hslToRgb(h,s,l).map(v=>v).join() }} />
      </div>
    </div>
  );

  const CopyRow = ({ label, value }: { label: string; value: string }) => (
    <button onClick={() => copy(value)}
      className="flex w-full items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-left transition hover:bg-white/10">
      <div>
        <p className="text-[9px] text-white/30">{label}</p>
        <p className="text-xs font-mono text-white/70">{value}</p>
      </div>
      {copied === value ? <Check size={12} className="text-accent-green" /> : <Copy size={12} className="text-white/25" />}
    </button>
  );

  return (
    <div className="flex h-full flex-col gap-4 p-4 overflow-y-auto no-scrollbar">
      {/* Preview */}
      <motion.div className="h-20 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: hex, boxShadow: `0 0 30px ${hex}55` }}
        animate={{ background: hex }}>
        <span className="text-xs font-mono font-bold" style={{ color: l > 50 ? "#000" : "#fff" }}>{hex}</span>
      </motion.div>

      {/* Sliders */}
      <div className="space-y-3">
        <Slider label="Hue" value={h} min={0} max={360} onChange={setH} bg={hueBg} />
        <Slider label="Saturation" value={s} min={0} max={100} onChange={setS} bg={satBg} />
        <Slider label="Lightness" value={l} min={0} max={100} onChange={setL} bg={lightBg} />
      </div>

      {/* Color values */}
      <div className="space-y-1.5">
        <CopyRow label="HEX" value={hex} />
        <CopyRow label="RGB" value={rgbStr} />
        <CopyRow label="HSL" value={hslStr} />
      </div>

      {/* Palette */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wide text-white/30">Saved Palette</p>
          <button onClick={addToPalette} className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/40 hover:bg-white/10 transition">
            <Plus size={10} /> Save
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {palette.map((p, i) => {
            const [pr, pg, pb] = hslToRgb(p.h, p.s, p.l);
            const ph = toHex(pr, pg, pb);
            return (
              <button key={i} onClick={() => { setH(p.h); setS(p.s); setL(p.l); }}
                className="group relative h-8 w-8 rounded-lg border border-white/10 transition hover:scale-110"
                style={{ background: ph }} title={ph}>
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition">
                  <Trash2 size={10} className="text-white" onClick={(e) => { e.stopPropagation(); setPalette(pl => pl.filter((_, j) => j !== i)); }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
