"use client";

import { motion } from "framer-motion";

/** Slow-drifting aurora blobs behind everything, purely decorative. */
export function Wallpaper() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-base-950">
      <motion.div
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-accent-blue/25 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-accent-purple/25 blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-1/3 h-[560px] w-[560px] rounded-full bg-accent-pink/20 blur-[130px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,7,0.6)_100%)]" />
    </div>
  );
}
