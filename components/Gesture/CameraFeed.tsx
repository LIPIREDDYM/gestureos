"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Video, VideoOff } from "lucide-react";
import type { CameraStatus, HandFrame } from "@/types/hand";
import { LandmarkIndex } from "@/types/hand";
import { GlassPanel } from "@/components/UI/GlassPanel";
import { cn } from "@/utils/cn";

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  frame: HandFrame | null;
  cameraStatus: CameraStatus;
  minimized: boolean;
  onToggleMinimize: () => void;
}

// MediaPipe's 21-point hand skeleton, expressed as connected bone pairs.
const HAND_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  [LandmarkIndex.WRIST, LandmarkIndex.THUMB_CMC],
  [LandmarkIndex.THUMB_CMC, LandmarkIndex.THUMB_MCP],
  [LandmarkIndex.THUMB_MCP, LandmarkIndex.THUMB_IP],
  [LandmarkIndex.THUMB_IP, LandmarkIndex.THUMB_TIP],
  [LandmarkIndex.WRIST, LandmarkIndex.INDEX_MCP],
  [LandmarkIndex.INDEX_MCP, LandmarkIndex.INDEX_PIP],
  [LandmarkIndex.INDEX_PIP, LandmarkIndex.INDEX_DIP],
  [LandmarkIndex.INDEX_DIP, LandmarkIndex.INDEX_TIP],
  [LandmarkIndex.INDEX_MCP, LandmarkIndex.MIDDLE_MCP],
  [LandmarkIndex.MIDDLE_MCP, LandmarkIndex.MIDDLE_PIP],
  [LandmarkIndex.MIDDLE_PIP, LandmarkIndex.MIDDLE_DIP],
  [LandmarkIndex.MIDDLE_DIP, LandmarkIndex.MIDDLE_TIP],
  [LandmarkIndex.MIDDLE_MCP, LandmarkIndex.RING_MCP],
  [LandmarkIndex.RING_MCP, LandmarkIndex.RING_PIP],
  [LandmarkIndex.RING_PIP, LandmarkIndex.RING_DIP],
  [LandmarkIndex.RING_DIP, LandmarkIndex.RING_TIP],
  [LandmarkIndex.RING_MCP, LandmarkIndex.PINKY_MCP],
  [LandmarkIndex.PINKY_MCP, LandmarkIndex.PINKY_PIP],
  [LandmarkIndex.PINKY_PIP, LandmarkIndex.PINKY_DIP],
  [LandmarkIndex.PINKY_DIP, LandmarkIndex.PINKY_TIP],
  [LandmarkIndex.WRIST, LandmarkIndex.PINKY_MCP],
];

const FINGERTIPS = [
  LandmarkIndex.THUMB_TIP,
  LandmarkIndex.INDEX_TIP,
  LandmarkIndex.MIDDLE_TIP,
  LandmarkIndex.RING_TIP,
  LandmarkIndex.PINKY_TIP,
];

/**
 * Renders the webcam preview with a canvas overlay tracing the hand
 * skeleton and glowing fingertip markers. The video is mirrored (scaleX -1)
 * so movement feels natural — moving your hand right moves things right.
 */
export function CameraFeed({ videoRef, frame, cameraStatus, minimized, onToggleMinimize }: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    if (!frame) return;

    // Mirror x so the overlay matches the mirrored video underneath.
    const toPx = (x: number, y: number) => [(1 - x) * width, y * height] as const;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(10, 132, 255, 0.85)";
    ctx.shadowColor = "rgba(10, 132, 255, 0.6)";
    ctx.shadowBlur = 6;
    HAND_CONNECTIONS.forEach(([a, b]) => {
      const [ax, ay] = toPx(frame.landmarks[a].x, frame.landmarks[a].y);
      const [bx, by] = toPx(frame.landmarks[b].x, frame.landmarks[b].y);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    });

    frame.landmarks.forEach((lm, i) => {
      const [x, y] = toPx(lm.x, lm.y);
      const isTip = FINGERTIPS.includes(i);
      ctx.beginPath();
      ctx.fillStyle = isTip ? "rgba(191, 90, 242, 0.95)" : "rgba(255,255,255,0.85)";
      ctx.shadowColor = isTip ? "rgba(191, 90, 242, 0.9)" : "transparent";
      ctx.shadowBlur = isTip ? 12 : 0;
      ctx.arc(x, y, isTip ? 6 : 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [frame, videoRef]);

  return (
    <motion.div
      layout
      className="fixed bottom-6 right-6 z-[60]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <GlassPanel
        strong
        className={cn(
          "overflow-hidden rounded-3xl transition-[width,height] duration-300 ease-out",
          minimized ? "h-14 w-14" : "h-44 w-60"
        )}
      >
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn(
              "h-full w-full object-cover [transform:scaleX(-1)]",
              minimized && "opacity-0"
            )}
          />
          <canvas
            ref={canvasRef}
            className={cn("pointer-events-none absolute inset-0 h-full w-full", minimized && "opacity-0")}
          />

          {cameraStatus !== "streaming" && !minimized && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-900/70 text-center text-xs text-white/60">
              {cameraStatus === "requesting" && "Requesting camera…"}
              {cameraStatus === "denied" && "Camera access denied"}
              {cameraStatus === "error" && "Camera unavailable"}
              {cameraStatus === "idle" && "Camera off"}
            </div>
          )}

          <button
            onClick={onToggleMinimize}
            className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white/80 backdrop-blur-md transition hover:bg-black/60"
            aria-label={minimized ? "Expand camera preview" : "Minimize camera preview"}
          >
            {minimized ? <Video size={14} /> : <VideoOff size={14} />}
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
