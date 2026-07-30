"use client";

import { useEffect, useRef } from "react";
import type { WallpaperTheme } from "@/hooks/useSettings";

interface WallpaperProps {
  theme?: WallpaperTheme;
}

const THEME_COLORS: Record<WallpaperTheme, { base: string; blobs: [string, string, string] }> = {
  space: {
    base: "#03030a",
    blobs: ["rgba(10,132,255,0.22)", "rgba(191,90,242,0.22)", "rgba(255,55,95,0.16)"],
  },
  cyberpunk: {
    base: "#0d0006",
    blobs: ["rgba(255,0,128,0.22)", "rgba(0,255,200,0.18)", "rgba(120,0,255,0.18)"],
  },
  forest: {
    base: "#030f05",
    blobs: ["rgba(48,209,88,0.20)", "rgba(100,210,255,0.16)", "rgba(10,132,255,0.14)"],
  },
  ocean: {
    base: "#03080f",
    blobs: ["rgba(10,132,255,0.24)", "rgba(100,210,255,0.20)", "rgba(48,209,88,0.14)"],
  },
};

export function Wallpaper({ theme = "space" }: WallpaperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = THEME_COLORS[theme];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    interface Star {
      x: number; y: number; r: number;
      alpha: number; speed: number; twinkleOffset: number;
    }

    let stars: Star[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random() * 0.65 + 0.1,
        speed: Math.random() * 0.015 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.012;

      for (const s of stars) {
        const twinkle = s.alpha * (0.7 + 0.3 * Math.sin(t * s.speed * 80 + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle.toFixed(3)})`;
        ctx.fill();
      }

      // Occasional shooting star
      if (Math.random() < 0.003) {
        const sx = Math.random() * width;
        const sy = Math.random() * height * 0.5;
        const len = 60 + Math.random() * 90;
        const grad = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.3);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, "rgba(210,230,255,0.75)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy + len * 0.3);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: colors.base }}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" />

      {/* Theme-colored aurora blobs */}
      <div className="aurora-blob aurora-blue" style={{ background: colors.blobs[0] }} />
      <div className="aurora-blob aurora-purple" style={{ background: colors.blobs[1] }} />
      <div className="aurora-blob aurora-pink" style={{ background: colors.blobs[2] }} />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, transparent 30%, ${colors.base}88 75%, ${colors.base}dd 100%)`,
        }}
      />
      {/* Top scan line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${colors.blobs[0]} 40%, ${colors.blobs[1]} 60%, transparent)` }}
      />
    </div>
  );
}
