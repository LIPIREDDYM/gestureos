"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Flame, CheckCircle2, Circle } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
}

const COLORS = [
  "bg-accent-blue", "bg-accent-purple", "bg-accent-pink",
  "bg-accent-green", "bg-accent-teal", "bg-accent-amber",
];

const STORAGE_KEY = "gestureos:habits";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function streak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  let count = 0;
  let check = new Date();
  for (const d of sorted) {
    const expected = check.toISOString().slice(0, 10);
    if (d === expected) {
      count++;
      check.setDate(check.getDate() - 1);
    } else break;
  }
  return count;
}

function last7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newName, setNewName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHabits(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); } catch { /* ignore */ }
  }, [habits]);

  const addHabit = () => {
    const name = newName.trim();
    if (!name) return;
    setHabits((h) => [...h, { id: String(Date.now()), name, color: COLORS[colorIdx], completedDates: [] }]);
    setNewName("");
    setColorIdx((i) => (i + 1) % COLORS.length);
  };

  const toggle = (id: string) => {
    const t = today();
    setHabits((prev) => prev.map((h) => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(t);
      return {
        ...h,
        completedDates: done
          ? h.completedDates.filter((d) => d !== t)
          : [...h.completedDates, t],
      };
    }));
  };

  const remove = (id: string) => setHabits((h) => h.filter((x) => x.id !== id));

  const days = last7();
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const todayStr = today();

  return (
    <div className="flex h-full flex-col">
      {/* Add habit */}
      <div className="flex items-center gap-2 border-b border-white/10 p-3">
        <div className="flex gap-1">
          {COLORS.map((c, i) => (
            <button key={c} onClick={() => setColorIdx(i)} className={`h-4 w-4 rounded-full ${c} transition ${colorIdx === i ? "ring-2 ring-white/60 scale-110" : "opacity-50"}`} />
          ))}
        </div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="Add a habit…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
        />
        <button onClick={addHabit} disabled={!newName.trim()} className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue/20 text-accent-blue transition hover:bg-accent-blue/30 disabled:opacity-30">
          <Plus size={14} />
        </button>
      </div>

      {/* Week header */}
      <div className="flex items-center border-b border-white/5 px-4 py-2">
        <span className="flex-1 text-[10px] text-white/30">Habit</span>
        <div className="flex gap-2">
          {days.map((d, i) => (
            <div key={d} className={`w-6 text-center text-[9px] ${d === todayStr ? "text-accent-blue font-bold" : "text-white/25"}`}>
              {dayLabels[new Date(d + "T12:00:00").getDay()]}
            </div>
          ))}
          <div className="w-10 text-center text-[9px] text-white/25">🔥</div>
        </div>
      </div>

      {/* Habits list */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence>
          {habits.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-white/20">
              <CheckCircle2 size={28} />
              <p className="text-sm">No habits yet — add one above</p>
            </div>
          )}
          {habits.map((habit) => {
            const s = streak(habit.completedDates);
            const doneToday = habit.completedDates.includes(todayStr);
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-center border-b border-white/[0.04] px-4 py-3"
              >
                <button onClick={() => toggle(habit.id)} className="mr-3 shrink-0">
                  {doneToday
                    ? <CheckCircle2 size={18} className={habit.color.replace("bg-", "text-")} />
                    : <Circle size={18} className="text-white/20" />}
                </button>
                <span className={`flex-1 text-sm ${doneToday ? "line-through text-white/30" : "text-white/80"}`}>
                  {habit.name}
                </span>
                <div className="flex gap-2">
                  {days.map((d) => {
                    const done = habit.completedDates.includes(d);
                    const isToday = d === todayStr;
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setHabits((prev) => prev.map((h) => {
                            if (h.id !== habit.id) return h;
                            const already = h.completedDates.includes(d);
                            return { ...h, completedDates: already ? h.completedDates.filter((x) => x !== d) : [...h.completedDates, d] };
                          }));
                        }}
                        className={`h-6 w-6 rounded-md transition ${done ? `${habit.color} opacity-90` : isToday ? "bg-white/10 hover:bg-white/15" : "bg-white/[0.04] hover:bg-white/10"}`}
                      />
                    );
                  })}
                  <div className={`flex w-10 items-center justify-center gap-0.5 text-xs ${s > 0 ? "text-accent-amber" : "text-white/20"}`}>
                    {s > 0 && <Flame size={11} />}
                    <span>{s}</span>
                  </div>
                </div>
                <button onClick={() => remove(habit.id)} className="ml-2 opacity-0 transition group-hover:opacity-100 text-white/20 hover:text-accent-pink">
                  <Trash2 size={12} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {habits.length > 0 && (
        <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs text-white/30">
          <span>{habits.filter((h) => h.completedDates.includes(todayStr)).length}/{habits.length} done today</span>
          <span>{habits.reduce((acc, h) => acc + streak(h.completedDates), 0)} total streak days</span>
        </div>
      )}
    </div>
  );
}
