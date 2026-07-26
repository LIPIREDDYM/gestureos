"use client";

import { useEffect, useRef } from "react";

/**
 * Dark aesthetic wallpaper:
 * - Deep space gradient base
 * - Animated star field (canvas, 2D only — no GPU contention with MediaPipe)
 * - Subtle CSS aurora blobs for color
 * - Fine grid overlay
 * - Scan-line vignette
 */
export function Wallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    interface Star {
      x: number;
      y: number;
      r: number;
      alpha: number;
      speed: number;
      twinkleOffset: number;
    }

    let stars: Star[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Re-seed stars on resize
      stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.015 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Stars
      t += 0.012;
      for (const s of stars) {
        const twinkle = s.alpha * (0.7 + 0.3 * Math.sin(t * s.speed * 80 + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle.toFixed(3)})`;
        ctx.fill();
      }

      // Occasional bright shooting star
      if (Math.random() < 0.003) {
        const sx = Math.random() * width;
        const sy = Math.random() * height * 0.5;
        const len = 60 + Math.random() * 80;
        const grad = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.3);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, "rgba(200,220,255,0.7)");
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

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#03030a" }}>
      {/* Star field canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.9 }}
      />

      {/* Aurora color blobs — CSS animated, no Framer Motion */}
      <div className="aurora-blob aurora-blue" />
      <div className="aurora-blob aurora-purple" />
      <div className="aurora-blob aurora-pink" />

      {/* Fine grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(3,3,10,0.55) 75%, rgba(3,3,10,0.85) 100%)",
        }}
      />

      {/* Top scan-line shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(10,132,255,0.4) 40%, rgba(191,90,242,0.4) 60%, transparent)",
        }}
      />
    </div>
  );
}
