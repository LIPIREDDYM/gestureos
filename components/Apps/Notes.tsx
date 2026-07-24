"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, StickyNote, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  body: string;
  color: string;
}

const INITIAL_NOTES: Note[] = [
  { id: "1", title: "Welcome to GestureOS", body: "Try a thumbs-up gesture to save this note!", color: "from-accent-blue/30 to-accent-purple/30" },
  { id: "2", title: "Groceries", body: "Oat milk, avocados, sourdough, coffee beans.", color: "from-accent-green/30 to-accent-teal/30" },
  { id: "3", title: "Demo idea", body: "Wave open palm to show the launcher on stage.", color: "from-accent-amber/30 to-accent-pink/30" },
];

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeId, setActiveId] = useState<string>(INITIAL_NOTES[0].id);
  const active = notes.find((n) => n.id === activeId) ?? notes[0];

  const addNote = () => {
    const id = String(Date.now());
    const note: Note = { id, title: "Untitled", body: "", color: "from-accent-blue/30 to-accent-purple/30" };
    setNotes((prev) => [note, ...prev]);
    setActiveId(id);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id && notes.length > 1) {
      setActiveId(notes.find((n) => n.id !== id)!.id);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex w-48 flex-col border-r border-white/10 bg-white/[0.02]">
        <button
          onClick={addNote}
          className="m-2 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-xs font-medium text-white/80 transition hover:bg-white/15"
        >
          <Plus size={14} /> New note
        </button>
        <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-2 no-scrollbar">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveId(note.id)}
              className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                note.id === activeId ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <span className="truncate text-white/80">{note.title || "Untitled"}</span>
              <Trash2
                size={12}
                className="shrink-0 text-white/30 opacity-0 transition hover:text-accent-pink group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col p-5"
      >
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${active.color}`}>
          <StickyNote size={18} />
        </div>
        <input
          value={active.title}
          onChange={(e) =>
            setNotes((prev) => prev.map((n) => (n.id === active.id ? { ...n, title: e.target.value } : n)))
          }
          className="mb-2 bg-transparent text-lg font-semibold outline-none placeholder:text-white/30"
          placeholder="Title"
        />
        <textarea
          value={active.body}
          onChange={(e) =>
            setNotes((prev) => prev.map((n) => (n.id === active.id ? { ...n, body: e.target.value } : n)))
          }
          className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-white/70 outline-none placeholder:text-white/30"
          placeholder="Start typing…"
        />
      </motion.div>
    </div>
  );
}
