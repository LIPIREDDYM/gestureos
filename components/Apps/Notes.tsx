"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, StickyNote, Trash2, Save } from "lucide-react";

interface Note {
  id: string;
  title: string;
  body: string;
  color: string;
  updatedAt: number;
}

const COLORS = [
  "from-accent-blue/30 to-accent-purple/30",
  "from-accent-green/30 to-accent-teal/30",
  "from-accent-amber/30 to-accent-pink/30",
  "from-accent-purple/30 to-accent-pink/30",
  "from-accent-teal/30 to-accent-blue/30",
];

const INITIAL_NOTES: Note[] = [
  {
    id: "1",
    title: "Welcome to GestureOS",
    body: "Try a thumbs-up gesture to save this note!\n\nYour notes are now saved automatically to your browser.",
    color: COLORS[0],
    updatedAt: Date.now(),
  },
  {
    id: "2",
    title: "Groceries",
    body: "Oat milk, avocados, sourdough, coffee beans.",
    color: COLORS[1],
    updatedAt: Date.now(),
  },
  {
    id: "3",
    title: "Demo idea",
    body: "Wave open palm to show the launcher on stage.",
    color: COLORS[2],
    updatedAt: Date.now(),
  },
];

const STORAGE_KEY = "gestureos:notes";
const ACTIVE_KEY = "gestureos:activeNote";

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Note[];
  } catch {
    /* ignore parse errors */
  }
  return INITIAL_NOTES;
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    /* quota exceeded or private browsing */
  }
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeId, setActiveId] = useState<string>(INITIAL_NOTES[0].id);
  const [savedFlash, setSavedFlash] = useState(false);

  // Load from localStorage on first mount (client only)
  useEffect(() => {
    const stored = loadNotes();
    setNotes(stored);
    const storedActive = localStorage.getItem(ACTIVE_KEY);
    if (storedActive && stored.find((n) => n.id === storedActive)) {
      setActiveId(storedActive);
    } else if (stored.length > 0) {
      setActiveId(stored[0].id);
    }
  }, []);

  // Auto-save whenever notes change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist active note id
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, activeId);
    } catch {/* ignore */}
  }, [activeId]);

  const active = notes.find((n) => n.id === activeId) ?? notes[0];

  const updateNote = (id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
  };

  const addNote = () => {
    const id = String(Date.now());
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const note: Note = { id, title: "Untitled", body: "", color, updatedAt: Date.now() };
    setNotes((prev) => [note, ...prev]);
    setActiveId(id);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  // Listen for the global thumbs-up gesture event to trigger save feedback
  useEffect(() => {
    const onThumbsUp = () => {
      saveNotes(notes);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    };
    window.addEventListener("gestureos:thumbsup", onThumbsUp);
    return () => window.removeEventListener("gestureos:thumbsup", onThumbsUp);
  }, [notes]);

  const handleSave = () => {
    saveNotes(notes);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
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
              <div className="min-w-0">
                <p className="truncate text-white/80">{note.title || "Untitled"}</p>
                <p className="truncate text-[10px] text-white/30">{formatDate(note.updatedAt)}</p>
              </div>
              <Trash2
                size={12}
                className="ml-1 shrink-0 text-white/30 opacity-0 transition hover:text-accent-pink group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      {active ? (
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${active.color}`}
            >
              <StickyNote size={18} />
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition ${
                savedFlash
                  ? "bg-accent-green/30 text-accent-green"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              <Save size={11} />
              {savedFlash ? "Saved!" : "Save"}
            </button>
          </div>
          <input
            value={active.title}
            onChange={(e) => updateNote(active.id, { title: e.target.value })}
            className="mb-2 bg-transparent text-lg font-semibold outline-none placeholder:text-white/30"
            placeholder="Title"
          />
          <textarea
            value={active.body}
            onChange={(e) => updateNote(active.id, { body: e.target.value })}
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-white/70 outline-none placeholder:text-white/30"
            placeholder="Start typing…"
          />
          <p className="mt-2 text-[10px] text-white/20">
            {active.body.trim().split(/\s+/).filter(Boolean).length} words · auto-saved
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-white/30">
          No notes yet — click "New note" to start
        </div>
      )}
    </div>
  );
}
