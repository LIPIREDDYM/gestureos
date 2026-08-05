"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical } from "lucide-react";

type Priority = "low" | "medium" | "high";
interface Card {
  id: string;
  text: string;
  priority: Priority;
  tag: string;
}
interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-accent-green/20 text-accent-green",
  medium: "bg-accent-amber/20 text-accent-amber",
  high: "bg-accent-pink/20 text-accent-pink",
};

const STORAGE_KEY = "gestureos:kanban";

const INITIAL: Column[] = [
  {
    id: "todo", title: "To Do", color: "border-accent-blue/40",
    cards: [
      { id: "1", text: "Build gesture macro system", priority: "high", tag: "Dev" },
      { id: "2", text: "Design new wallpaper themes", priority: "medium", tag: "Design" },
      { id: "3", text: "Write README documentation", priority: "low", tag: "Docs" },
    ],
  },
  {
    id: "inprogress", title: "In Progress", color: "border-accent-amber/40",
    cards: [
      { id: "4", text: "Improve gesture detection accuracy", priority: "high", tag: "Dev" },
      { id: "5", text: "Add Kanban board app", priority: "medium", tag: "Feature" },
    ],
  },
  {
    id: "done", title: "Done", color: "border-accent-green/40",
    cards: [
      { id: "6", text: "Boot screen animation", priority: "low", tag: "UI" },
      { id: "7", text: "Notification center", priority: "medium", tag: "Feature" },
    ],
  },
];

export function Kanban() {
  const [columns, setColumns] = useState<Column[]>(INITIAL);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newTag, setNewTag] = useState("Feature");
  const dragCardRef = useRef<{ cardId: string; fromColId: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) setColumns(JSON.parse(r)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(columns)); } catch {}
  }, [columns]);

  const addCard = (colId: string) => {
    if (!newText.trim()) return;
    setColumns(prev => prev.map(col => col.id !== colId ? col : {
      ...col,
      cards: [...col.cards, { id: String(Date.now()), text: newText.trim(), priority: newPriority, tag: newTag }],
    }));
    setNewText(""); setAddingTo(null);
  };

  const deleteCard = (colId: string, cardId: string) => {
    setColumns(prev => prev.map(col => col.id !== colId ? col : { ...col, cards: col.cards.filter(c => c.id !== cardId) }));
  };

  const onDragStart = (cardId: string, fromColId: string) => {
    dragCardRef.current = { cardId, fromColId };
  };

  const onDrop = (toColId: string) => {
    const drag = dragCardRef.current;
    if (!drag || drag.fromColId === toColId) { setDragOver(null); return; }
    let card: Card | undefined;
    setColumns(prev => {
      const next = prev.map(col => {
        if (col.id === drag.fromColId) {
          card = col.cards.find(c => c.id === drag.cardId);
          return { ...col, cards: col.cards.filter(c => c.id !== drag.cardId) };
        }
        return col;
      });
      return next.map(col => col.id !== toColId || !card ? col : { ...col, cards: [...col.cards, card!] });
    });
    dragCardRef.current = null;
    setDragOver(null);
  };

  const totalCards = columns.reduce((s, c) => s + c.cards.length, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="text-xs text-white/40">{totalCards} tasks across {columns.length} columns</span>
        <div className="flex gap-1">
          {(["low", "medium", "high"] as Priority[]).map(p => (
            <span key={p} className={`rounded-md px-2 py-0.5 text-[9px] capitalize ${PRIORITY_COLORS[p]}`}>{p}</span>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className="flex flex-1 gap-3 overflow-x-auto p-3 no-scrollbar">
        {columns.map(col => (
          <div key={col.id}
            className={`flex w-64 shrink-0 flex-col rounded-2xl border ${col.color} transition-colors duration-200 ${dragOver === col.id ? "bg-white/[0.06]" : "bg-white/[0.03]"}`}
            onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => onDrop(col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/80">{col.title}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-white/50">{col.cards.length}</span>
              </div>
              <button onClick={() => { setAddingTo(col.id); setNewText(""); }}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/10 hover:text-white/70">
                <Plus size={12} />
              </button>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 no-scrollbar">
              <AnimatePresence>
                {col.cards.map(card => (
                  <motion.div key={card.id}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    draggable onDragStart={() => onDragStart(card.id, col.id)}
                    className="group cursor-grab rounded-xl bg-white/[0.06] border border-white/10 p-3 active:cursor-grabbing hover:border-white/20 transition"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={12} className="mt-0.5 shrink-0 text-white/20" />
                      <p className="flex-1 text-xs leading-relaxed text-white/80">{card.text}</p>
                      <button onClick={() => deleteCard(col.id, card.id)}
                        className="shrink-0 text-white/10 opacity-0 transition group-hover:opacity-100 hover:text-accent-pink">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] capitalize ${PRIORITY_COLORS[card.priority]}`}>{card.priority}</span>
                      {card.tag && <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-white/35">{card.tag}</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add card form */}
              <AnimatePresence>
                {addingTo === col.id && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-xl border border-accent-blue/30 bg-white/[0.06] p-3 space-y-2">
                    <textarea value={newText} onChange={e => setNewText(e.target.value)}
                      autoFocus placeholder="Task description…"
                      className="w-full resize-none bg-transparent text-xs text-white/80 outline-none placeholder:text-white/25 h-16"
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addCard(col.id); } if (e.key === "Escape") setAddingTo(null); }}
                    />
                    <div className="flex gap-1">
                      {(["low", "medium", "high"] as Priority[]).map(p => (
                        <button key={p} onClick={() => setNewPriority(p)}
                          className={`rounded-md px-2 py-0.5 text-[9px] capitalize transition ${newPriority === p ? PRIORITY_COLORS[p] : "bg-white/5 text-white/30"}`}>{p}</button>
                      ))}
                    </div>
                    <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Tag"
                      className="w-full bg-transparent text-[10px] text-white/50 outline-none placeholder:text-white/20 border-b border-white/10 pb-1" />
                    <div className="flex gap-2">
                      <button onClick={() => addCard(col.id)} className="flex-1 rounded-lg bg-accent-blue/20 py-1 text-[10px] text-accent-blue transition hover:bg-accent-blue/30">Add</button>
                      <button onClick={() => setAddingTo(null)} className="rounded-lg bg-white/5 px-3 py-1 text-[10px] text-white/40 transition hover:bg-white/10">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
