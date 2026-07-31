"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, Download, Minus, Plus } from "lucide-react";

const COLORS = ["#ffffff", "#0A84FF", "#BF5AF2", "#FF375F", "#30D158", "#FFD60A", "#64D2FF", "#FF9F0A"];
const TOOLS = ["pen", "eraser"] as const;
type Tool = typeof TOOLS[number];

export function Sketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<Tool>("pen");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Set canvas size to match display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    const last = lastPosRef.current ?? pos;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = size * 4;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      // Soft glow for pen
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 1.5;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.shadowBlur = 0;

    lastPosRef.current = pos;
  };

  const onPointerUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Composite onto a dark bg for download
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const ctx = tmp.getContext("2d")!;
    ctx.fillStyle = "#050507";
    ctx.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement("a");
    link.href = tmp.toDataURL("image/png");
    link.download = "sketch.png";
    link.click();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-2 flex-wrap">
        {/* Colors */}
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pen"); }}
              className={`h-5 w-5 rounded-full border-2 transition ${color === c && tool === "pen" ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Size */}
        <div className="flex items-center gap-1">
          <button onClick={() => setSize((s) => Math.max(1, s - 1))} className="text-white/40 hover:text-white"><Minus size={12} /></button>
          <span className="w-5 text-center text-xs text-white/60 tabular-nums">{size}</span>
          <button onClick={() => setSize((s) => Math.min(40, s + 1))} className="text-white/40 hover:text-white"><Plus size={12} /></button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Eraser */}
        <button
          onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
          className={`rounded-lg px-2 py-1 text-xs transition ${tool === "eraser" ? "bg-accent-pink/30 text-accent-pink" : "text-white/40 hover:text-white/70"}`}
        >
          Eraser
        </button>

        <div className="ml-auto flex gap-1">
          <button onClick={clear} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/40 transition hover:bg-white/10">
            <Trash2 size={11} /> Clear
          </button>
          <button onClick={download} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/40 transition hover:bg-white/10">
            <Download size={11} /> Save
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none"
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        <p className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-white/15">
          {tool === "eraser" ? "Erasing" : `Drawing · size ${size}`}
        </p>
      </div>
    </div>
  );
}
