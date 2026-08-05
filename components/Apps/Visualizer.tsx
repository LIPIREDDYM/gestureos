"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Music2 } from "lucide-react";

type VisMode = "bars" | "wave" | "radial";

const MODES: VisMode[] = ["bars", "wave", "radial"];

const THEMES = {
  aurora:  ["#0A84FF", "#BF5AF2", "#FF375F", "#64D2FF"],
  fire:    ["#FF9F0A", "#FF375F", "#FFD60A", "#FF6B35"],
  matrix:  ["#30D158", "#00FF41", "#64D2FF", "#0A84FF"],
  mono:    ["rgba(255,255,255,0.8)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"],
};

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<VisMode>("bars");
  const [theme, setTheme] = useState<keyof typeof THEMES>("aurora");
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      setActive(true);
      setError(null);
    } catch {
      setError("Microphone access denied");
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setActive(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = THEMES[theme];

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width = canvas.clientWidth;
      const H = canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "rgba(3,3,10,0.95)");
      bg.addColorStop(1, "rgba(5,5,20,0.98)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (!analyserRef.current) {
        // Idle animation
        const t = Date.now() / 1000;
        if (mode === "bars") {
          const bars = 32;
          const bw = W / bars - 2;
          for (let i = 0; i < bars; i++) {
            const h = Math.abs(Math.sin(t * 1.5 + i * 0.4)) * 20 + 4;
            ctx.fillStyle = colors[i % colors.length] + "44";
            ctx.beginPath();
            const rx = i * (bw + 2) + 1;
            ctx.roundRect(rx, H / 2 - h, bw, h * 2, 3);
            ctx.fill();
          }
        }
        return;
      }

      const bufLen = analyserRef.current.frequencyBinCount;
      const dataArr = new Uint8Array(bufLen);

      if (mode === "bars") {
        analyserRef.current.getByteFrequencyData(dataArr);
        const bars = Math.min(64, bufLen);
        const bw = (W / bars) - 1.5;
        for (let i = 0; i < bars; i++) {
          const v = dataArr[i] / 255;
          const h = v * H * 0.85;
          const color = colors[i % colors.length];
          const grad = ctx.createLinearGradient(0, H, 0, H - h);
          grad.addColorStop(0, color + "99");
          grad.addColorStop(1, color);
          ctx.fillStyle = grad;
          ctx.shadowColor = color;
          ctx.shadowBlur = v * 12;
          ctx.beginPath();
          ctx.roundRect(i * (bw + 1.5) + 0.75, H - h, bw, h, [3, 3, 0, 0]);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      } else if (mode === "wave") {
        analyserRef.current.getByteTimeDomainData(dataArr);
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        colors.forEach((color, ci) => {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          const offset = ci * 6;
          for (let i = 0; i < bufLen; i++) {
            const x = (i / bufLen) * W;
            const v = (dataArr[i] / 128 - 1) * (H * 0.3) + offset;
            const y = H / 2 + v;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      } else if (mode === "radial") {
        analyserRef.current.getByteFrequencyData(dataArr);
        const cx = W / 2, cy = H / 2;
        const baseR = Math.min(W, H) * 0.18;
        const bars = 80;
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
          const v = dataArr[Math.floor((i / bars) * bufLen)] / 255;
          const len = baseR + v * baseR * 1.8;
          const color = colors[i % colors.length];
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * baseR, cy + Math.sin(angle) * baseR);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = color;
          ctx.shadowBlur = v * 16;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        // Center circle
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR);
        grad.addColorStop(0, colors[0] + "33");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active, mode, theme]);

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 flex-wrap">
        <button onClick={active ? stop : start}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${active ? "bg-accent-pink/20 text-accent-pink" : "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30"}`}>
          {active ? <><MicOff size={12}/> Stop</> : <><Mic size={12}/> Start</>}
        </button>

        <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-md px-2.5 py-1 text-[10px] capitalize transition ${mode === m ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}>
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(Object.keys(THEMES) as (keyof typeof THEMES)[]).map(t => (
            <button key={t} onClick={() => setTheme(t)}
              className={`h-5 w-5 rounded-full transition ${theme === t ? "ring-2 ring-white/60 scale-110" : "opacity-50 hover:opacity-80"}`}
              style={{ background: `linear-gradient(135deg, ${THEMES[t][0]}, ${THEMES[t][1]})` }}
              title={t}
            />
          ))}
        </div>

        {error && <span className="text-[10px] text-accent-pink">{error}</span>}
        {!active && !error && <span className="text-[10px] text-white/30 flex items-center gap-1"><Music2 size={10}/> Click Start to activate mic</span>}
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="flex-1 w-full" />
    </div>
  );
}
