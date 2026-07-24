"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { sendMessage, type AiMessage } from "@/lib/ai/aiClient";

const SUGGESTIONS = ["What gestures can you see?", "What's the weather like?", "Open my notes"];

export function AIAssistant() {
  const [messages, setMessages] = useState<AiMessage[]>([
    { role: "assistant", content: "Hi! I'm your GestureOS assistant. Ask me anything, or try a suggestion below." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: AiMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await sendMessage(next);
      setMessages((prev) => [...prev, { role: "assistant", content: res.content }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 no-scrollbar">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "bg-aurora text-white" : "bg-white/10 text-white/85"
              }`}
            >
              {m.role === "assistant" && (
                <span className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-white/40">
                  <Sparkles size={10} /> Assistant
                </span>
              )}
              {m.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 size={12} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(input)}
          placeholder="Ask the assistant…"
          className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:bg-white/10"
        />
        <button
          onClick={() => submit(input)}
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora text-white transition disabled:opacity-30"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
