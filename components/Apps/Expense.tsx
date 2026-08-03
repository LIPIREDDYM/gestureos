"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

type EntryType = "income" | "expense";

interface Entry {
  id: string;
  type: EntryType;
  amount: number;
  category: string;
  note: string;
  date: string;
}

const EXPENSE_CATS = ["Food", "Transport", "Shopping", "Health", "Entertainment", "Bills", "Other"];
const INCOME_CATS = ["Salary", "Freelance", "Investment", "Gift", "Other"];

const CAT_COLORS: Record<string, string> = {
  Food: "#FF375F", Transport: "#0A84FF", Shopping: "#BF5AF2",
  Health: "#30D158", Entertainment: "#FFD60A", Bills: "#FF9F0A",
  Salary: "#30D158", Freelance: "#64D2FF", Investment: "#0A84FF",
  Gift: "#FF375F", Other: "rgba(255,255,255,0.3)",
};

const STORAGE_KEY = "gestureos:expenses";

export function Expense() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tab, setTab] = useState<"dashboard" | "add">("dashboard");
  const [form, setForm] = useState({ type: "expense" as EntryType, amount: "", category: "Food", note: "" });

  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) setEntries(JSON.parse(r)); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
  }, [entries]);

  const add = () => {
    const amt = parseFloat(form.amount);
    if (!amt || isNaN(amt)) return;
    setEntries(prev => [{
      id: String(Date.now()), type: form.type, amount: amt,
      category: form.category, note: form.note,
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
    }, ...prev]);
    setForm(f => ({ ...f, amount: "", note: "" }));
    setTab("dashboard");
  };

  const remove = (id: string) => setEntries(p => p.filter(e => e.id !== id));

  const totalIncome = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // Category breakdown for expenses
  const breakdown = EXPENSE_CATS.map(cat => ({
    cat, total: entries.filter(e => e.type === "expense" && e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(b => b.total > 0).sort((a, b) => b.total - a.total);

  const maxBreakdown = breakdown[0]?.total || 1;

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-white/10">
        {(["dashboard", "add"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition capitalize ${tab === t ? "border-b-2 border-accent-blue text-white" : "text-white/40 hover:text-white/60"}`}>
            {t === "add" ? "+ Add Entry" : "Dashboard"}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Balance", value: balance, color: balance >= 0 ? "text-accent-green" : "text-accent-pink", icon: <DollarSign size={14}/> },
              { label: "Income", value: totalIncome, color: "text-accent-green", icon: <TrendingUp size={14}/> },
              { label: "Expenses", value: totalExpense, color: "text-accent-pink", icon: <TrendingDown size={14}/> },
            ].map(c => (
              <div key={c.label} className="rounded-xl bg-white/[0.04] p-3 flex flex-col gap-1">
                <div className={`flex items-center gap-1 ${c.color} opacity-70`}>{c.icon}<span className="text-[9px]">{c.label}</span></div>
                <span className={`text-sm font-semibold tabular-nums ${c.color}`}>₹{c.value.toFixed(0)}</span>
              </div>
            ))}
          </div>

          {/* Category chart */}
          {breakdown.length > 0 && (
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="mb-2 text-[10px] uppercase tracking-wide text-white/30">By Category</p>
              <div className="space-y-2">
                {breakdown.map(b => (
                  <div key={b.cat} className="flex items-center gap-2">
                    <span className="w-16 text-[10px] text-white/50 truncate">{b.cat}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: CAT_COLORS[b.cat] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(b.total / maxBreakdown) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="w-12 text-right text-[10px] tabular-nums text-white/50">₹{b.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent entries */}
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wide text-white/30">Recent</p>
            {entries.length === 0 && <p className="text-center text-xs text-white/20 py-4">No entries yet</p>}
            <AnimatePresence>
              {entries.slice(0, 20).map(e => (
                <motion.div key={e.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.04] transition">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px]"
                    style={{ background: CAT_COLORS[e.category] + "33" }}>
                    {e.type === "income" ? "+" : "-"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 truncate">{e.category}{e.note ? ` · ${e.note}` : ""}</p>
                    <p className="text-[9px] text-white/30">{e.date}</p>
                  </div>
                  <span className={`text-xs font-medium tabular-nums ${e.type === "income" ? "text-accent-green" : "text-accent-pink"}`}>
                    {e.type === "income" ? "+" : "-"}₹{e.amount.toFixed(0)}
                  </span>
                  <button onClick={() => remove(e.id)} className="opacity-0 group-hover:opacity-100 transition text-white/20 hover:text-accent-pink ml-1">
                    <Trash2 size={11} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {tab === "add" && (
        <div className="flex-1 p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["expense", "income"] as EntryType[]).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: t === "expense" ? "Food" : "Salary" }))}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition capitalize ${form.type === t
                  ? t === "expense" ? "bg-accent-pink/20 text-accent-pink" : "bg-accent-green/20 text-accent-green"
                  : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                {t === "expense" ? "− Expense" : "+ Income"}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="rounded-xl bg-white/[0.04] px-4 py-3">
            <p className="text-[10px] text-white/30 mb-1">Amount (₹)</p>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" className="w-full bg-transparent text-2xl font-light outline-none text-white placeholder:text-white/20" />
          </div>

          {/* Category */}
          <div>
            <p className="mb-2 text-[10px] text-white/30">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {(form.type === "expense" ? EXPENSE_CATS : INCOME_CATS).map(cat => (
                <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`rounded-lg px-2.5 py-1 text-xs transition ${form.category === cat ? "text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                  style={form.category === cat ? { background: CAT_COLORS[cat] + "33", color: CAT_COLORS[cat] } : {}}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Note (optional)" className="w-full rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm outline-none text-white/70 placeholder:text-white/20" />

          <button onClick={add} disabled={!form.amount}
            className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-30">
            <Plus size={14} className="inline mr-1.5" />Add Entry
          </button>
        </div>
      )}
    </div>
  );
}
