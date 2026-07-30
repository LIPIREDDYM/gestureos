"use client";

import { useSettings, type WallpaperTheme } from "@/hooks/useSettings";
import { RotateCcw, Sliders, Monitor, Palette, Volume2, Eye } from "lucide-react";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${value ? "bg-accent-blue" : "bg-white/20"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function Slider({ min, max, step = 1, value, onChange, fmt }: {
  min: number; max: number; step?: number; value: number;
  onChange: (v: number) => void; fmt?: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-right text-xs tabular-nums text-white/50">
        {fmt ? fmt(value) : value}
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-28 appearance-none rounded-full bg-white/20 accent-accent-blue"
      />
    </div>
  );
}

const WALLPAPERS: { id: WallpaperTheme; label: string; colors: string }[] = [
  { id: "space", label: "Space", colors: "from-[#03030a] to-[#0a0a1f]" },
  { id: "cyberpunk", label: "Cyberpunk", colors: "from-[#0d0d0d] to-[#1a0033]" },
  { id: "forest", label: "Forest", colors: "from-[#030f05] to-[#0a1f0a]" },
  { id: "ocean", label: "Ocean", colors: "from-[#03080f] to-[#0a1a2f]" },
];

export function Settings() {
  const s = useSettings();

  const sections = [
    {
      icon: <Sliders size={14} />,
      title: "Gesture Control",
      rows: [
        <Row key="sens" label="Sensitivity">
          <Slider
            min={0.4} max={0.85} step={0.05} value={s.gestureSensitivity}
            onChange={(v) => s.update({ gestureSensitivity: v })}
            fmt={(v) => `${Math.round(v * 100)}%`}
          />
        </Row>,
        <Row key="dwell" label="Dwell Time">
          <Slider
            min={600} max={2000} step={100} value={s.dwellTime}
            onChange={(v) => s.update({ dwellTime: v })}
            fmt={(v) => `${v}ms`}
          />
        </Row>,
        <Row key="model" label="Model Quality">
          <div className="flex gap-1">
            {([0, 1] as const).map((v) => (
              <button
                key={v}
                onClick={() => s.update({ modelComplexity: v })}
                className={`rounded-lg px-3 py-1 text-xs transition ${s.modelComplexity === v ? "bg-accent-blue text-white" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
              >
                {v === 0 ? "Fast" : "Accurate"}
              </button>
            ))}
          </div>
        </Row>,
      ],
    },
    {
      icon: <Monitor size={14} />,
      title: "Camera",
      rows: [
        <Row key="res" label="Resolution">
          <div className="flex gap-1">
            {(["480p", "720p", "1080p"] as const).map((r) => (
              <button
                key={r}
                onClick={() => s.update({ cameraResolution: r })}
                className={`rounded-lg px-2.5 py-1 text-xs transition ${s.cameraResolution === r ? "bg-accent-blue text-white" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </Row>,
        <Row key="fps" label="Show FPS">
          <Toggle value={s.showFPS} onChange={(v) => s.update({ showFPS: v })} />
        </Row>,
      ],
    },
    {
      icon: <Palette size={14} />,
      title: "Appearance",
      rows: [
        <Row key="wp" label="Wallpaper">
          <div className="flex gap-1.5">
            {WALLPAPERS.map((w) => (
              <button
                key={w.id}
                onClick={() => s.update({ wallpaperTheme: w.id })}
                title={w.label}
                className={`h-7 w-7 rounded-lg bg-gradient-to-br ${w.colors} transition ${s.wallpaperTheme === w.id ? "ring-2 ring-accent-blue ring-offset-1 ring-offset-transparent" : "opacity-60 hover:opacity-100"}`}
              />
            ))}
          </div>
        </Row>,
      ],
    },
    {
      icon: <Volume2 size={14} />,
      title: "Sound & Display",
      rows: [
        <Row key="snd" label="Sound Effects">
          <Toggle value={s.soundEnabled} onChange={(v) => s.update({ soundEnabled: v })} />
        </Row>,
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto p-5 no-scrollbar space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white/80">Settings</h2>
        <button
          onClick={s.reset}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:bg-white/10 hover:text-white/60"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {sections.map((sec) => (
        <div key={sec.title}>
          <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/30">
            {sec.icon} {sec.title}
          </div>
          <div className="space-y-1.5">{sec.rows}</div>
        </div>
      ))}
    </div>
  );
}
