"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { motion } from "framer-motion";

interface HistoryLine {
  type: "input" | "output" | "error";
  text: string;
}

const NEOFETCH = `
  ██████╗ ███████╗███████╗████████╗██╗   ██╗██████╗ ███████╗ ██████╗ ███████╗
 ██╔════╝ ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔═══██╗██╔════╝
 ██║  ███╗█████╗  ███████╗   ██║   ██║   ██║██████╔╝█████╗  ██║   ██║███████╗
 ██║   ██║██╔══╝  ╚════██║   ██║   ██║   ██║██╔══██╗██╔══╝  ██║   ██║╚════██║
 ╚██████╔╝███████╗███████║   ██║   ╚██████╔╝██║  ██║███████╗╚██████╔╝███████║
  ╚═════╝ ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝

  OS: GestureOS 1.0  Host: Webcam-Powered Desktop
  Kernel: MediaPipe 0.4  Shell: GestureSH  Resolution: ${typeof window !== "undefined" ? window.innerWidth : 1920}x${typeof window !== "undefined" ? window.innerHeight : 1080}
  DE: GlassUI  WM: GestureWM  Terminal: GestureTerm
  CPU: Hand Tracking @ 30fps  GPU: Aurora Renderer
  Memory: ∞ MB / ∞ MB
`;

const FILES = ["notes.txt", "music/", "gallery/", "README.md", "gestures.config"];

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () =>
    `Available commands:\n  help       show this message\n  ls         list files\n  pwd        print working directory\n  whoami     current user\n  date       current date and time\n  echo       print text\n  clear      clear terminal\n  neofetch   system info\n  gesture    gesture control info\n  apps       list installed apps\n  uname      system name`,

  ls: () => FILES.join("   "),
  pwd: () => "/home/gestureos",
  whoami: () => "gestureos-user",
  date: () => new Date().toLocaleString(),
  echo: (args) => args.join(" "),
  uname: () => "GestureOS 1.0.0 MediaPipe-WASM arm64",
  neofetch: () => NEOFETCH,
  gesture: () =>
    `Gesture Control Status: ACTIVE\n  ✋ Open Palm  → Launcher\n  🤏 Pinch     → Click\n  ✌️  Peace     → Assistant\n  👊 Fist      → Close window\n  👍 Thumbs Up → Save\n  👈 Swipe L   → Prev page\n  👉 Swipe R   → Next page`,
  apps: () =>
    `Installed applications:\n  notes · music · weather · calculator · gallery · assistant · terminal · clock · settings · files`,
};

export function Terminal() {
  const [history, setHistory] = useState<HistoryLine[]>([
    { type: "output", text: 'GestureTerm v1.0 — type "help" for commands' },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const run = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const newHistory: HistoryLine[] = [...history, { type: "input", text: `$ ${trimmed}` }];
    setCmdHistory((h) => [trimmed, ...h].slice(0, 50));
    setHistoryIdx(-1);

    const [cmd, ...args] = trimmed.split(" ");

    if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    const fn = COMMANDS[cmd];
    if (fn) {
      newHistory.push({ type: "output", text: fn(args) });
    } else {
      newHistory.push({ type: "error", text: `command not found: ${cmd}` });
    }

    setHistory(newHistory);
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(next);
      setInput(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? "" : cmdHistory[next] ?? "");
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-black/60 p-3 font-mono text-xs"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto space-y-0.5 no-scrollbar">
        {history.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              line.type === "input"
                ? "text-accent-green"
                : line.type === "error"
                ? "text-accent-pink"
                : "text-white/70"
            }
            style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
          >
            {line.text}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-1.5 border-t border-white/10 pt-2">
        <span className="text-accent-green">$</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent text-white/90 outline-none placeholder:text-white/20 caret-accent-green"
          placeholder="type a command…"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
