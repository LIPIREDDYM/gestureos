"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, FolderOpen, FileText, Music2, Image as ImageIcon,
  ChevronRight, Plus, Trash2, MoreHorizontal,
} from "lucide-react";

interface FSItem {
  id: string;
  name: string;
  type: "folder" | "file";
  kind?: "text" | "audio" | "image" | "code";
  size?: string;
  modified?: string;
  children?: FSItem[];
}

const INITIAL_FS: FSItem[] = [
  {
    id: "1", name: "Documents", type: "folder", children: [
      { id: "1-1", name: "Welcome.txt", type: "file", kind: "text", size: "2 KB", modified: "Today" },
      { id: "1-2", name: "GestureOS Notes.txt", type: "file", kind: "text", size: "4 KB", modified: "Today" },
    ],
  },
  {
    id: "2", name: "Music", type: "folder", children: [
      { id: "2-1", name: "Nebula Drift.mp3", type: "file", kind: "audio", size: "8.2 MB", modified: "Yesterday" },
      { id: "2-2", name: "Glass Horizon.mp3", type: "file", kind: "audio", size: "7.1 MB", modified: "Yesterday" },
    ],
  },
  {
    id: "3", name: "Gallery", type: "folder", children: [
      { id: "3-1", name: "aurora-01.jpg", type: "file", kind: "image", size: "3.4 MB", modified: "2 days ago" },
      { id: "3-2", name: "space-bg.png", type: "file", kind: "image", size: "5.1 MB", modified: "3 days ago" },
    ],
  },
  { id: "4", name: "README.md", type: "file", kind: "code", size: "1 KB", modified: "Today" },
];

function getIcon(item: FSItem) {
  if (item.type === "folder") return <Folder size={16} className="text-accent-amber" />;
  if (item.kind === "audio") return <Music2 size={16} className="text-accent-purple" />;
  if (item.kind === "image") return <ImageIcon size={16} className="text-accent-green" />;
  return <FileText size={16} className="text-accent-blue" />;
}

function FileRow({ item, depth, onSelect, selected }: {
  item: FSItem; depth: number; onSelect: (id: string) => void; selected: string | null;
}) {
  const [open, setOpen] = useState(false);
  const isSelected = selected === item.id;

  return (
    <>
      <button
        onClick={() => { onSelect(item.id); if (item.type === "folder") setOpen((o) => !o); }}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${isSelected ? "bg-white/10" : "hover:bg-white/[0.04]"}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {item.type === "folder" && (
          <ChevronRight size={12} className={`text-white/30 transition-transform ${open ? "rotate-90" : ""}`} />
        )}
        {item.type !== "folder" && <span className="w-3" />}
        {getIcon(item)}
        <span className="flex-1 truncate text-white/80">{item.name}</span>
        {item.size && <span className="text-white/30">{item.size}</span>}
        {item.modified && <span className="text-white/20">{item.modified}</span>}
      </button>
      {item.type === "folder" && open && item.children && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {item.children.map((child) => (
              <FileRow key={child.id} item={child} depth={depth + 1} onSelect={onSelect} selected={selected} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

export function Files() {
  const [fs, setFs] = useState<FSItem[]>(INITIAL_FS);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");

  const allFiles = fs.flatMap((item) =>
    item.type === "file" ? [item] : (item.children ?? [])
  );

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex-1 text-xs text-white/40">GestureOS / Home</span>
        <button
          onClick={() => setView((v) => v === "list" ? "grid" : "list")}
          className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-white/40 transition hover:bg-white/10"
        >
          {view === "list" ? "Grid" : "List"}
        </button>
        <button
          onClick={() => {
            const id = String(Date.now());
            setFs((prev) => [...prev, { id, name: "New Folder", type: "folder", children: [] }]);
          }}
          className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-white/40 transition hover:bg-white/10"
        >
          <Plus size={10} /> New
        </button>
      </div>

      {view === "list" ? (
        <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
          <div className="mb-1 flex gap-2 px-2 text-[10px] text-white/20">
            <span className="flex-1">Name</span>
            <span className="w-12 text-right">Size</span>
            <span className="w-16 text-right">Modified</span>
          </div>
          {fs.map((item) => (
            <FileRow key={item.id} item={item} depth={0} onSelect={setSelected} selected={selected} />
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <div className="grid grid-cols-3 gap-3">
            {[...fs, ...allFiles].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`flex flex-col items-center gap-2 rounded-xl p-3 text-center transition hover:bg-white/[0.06] ${selected === item.id ? "bg-white/10" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06]">
                  {item.type === "folder"
                    ? <FolderOpen size={24} className="text-accent-amber" />
                    : getIcon(item)}
                </div>
                <span className="w-full truncate text-[10px] text-white/70">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="border-t border-white/10 px-4 py-2 text-xs text-white/40">
          1 item selected
          <button className="ml-3 text-accent-pink hover:text-accent-pink/80" onClick={() => setSelected(null)}>
            Deselect
          </button>
        </div>
      )}
    </div>
  );
}
