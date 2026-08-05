"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Plus, Trash2, Copy, Eye, EyeOff, Check, Key, ShieldCheck } from "lucide-react";

interface VaultEntry {
  id: string;
  site: string;
  username: string;
  password: string; // stored as-is in localStorage (demo — not truly encrypted without a backend key store)
  note: string;
}

const STORAGE_KEY = "gestureos:vault:entries";
const PIN_KEY = "gestureos:vault:pin";

function generatePassword(len = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function strength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = ["text-accent-pink", "text-accent-pink", "text-accent-amber", "text-accent-amber", "text-accent-green", "text-accent-green"];
  return { score, label: labels[score] ?? "Strong", color: colors[score] ?? "text-accent-green" };
}

export function Vault() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinConfirm, setPinConfirm] = useState("");

  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ site: "", username: "", password: "", note: "" });
  const [showPassFor, setShowPassFor] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_KEY);
    if (!storedPin) setIsSettingPin(true);
    else setPin(storedPin);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) setEntries(JSON.parse(r)); } catch {}
  }, [unlocked]);

  useEffect(() => {
    if (unlocked) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
    }
  }, [entries, unlocked]);

  const setupPin = () => {
    if (pinInput.length < 4) return;
    if (pinInput !== pinConfirm) { setPinError(true); return; }
    localStorage.setItem(PIN_KEY, pinInput);
    setPin(pinInput); setIsSettingPin(false); setUnlocked(true);
    setPinInput(""); setPinConfirm(""); setPinError(false);
  };

  const unlock = () => {
    const stored = localStorage.getItem(PIN_KEY);
    if (pinInput === stored) { setUnlocked(true); setPinInput(""); setPinError(false); }
    else { setPinError(true); setPinInput(""); }
  };

  const addEntry = () => {
    if (!form.site || !form.password) return;
    setEntries(prev => [...prev, { id: String(Date.now()), ...form }]);
    setForm({ site: "", username: "", password: "", note: "" });
    setShowAdd(false);
  };

  const copyPw = (pw: string, id: string) => {
    navigator.clipboard.writeText(pw).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const pw = form.password;
  const pwStrength = strength(pw);

  if (!unlocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-blue to-accent-purple shadow-glow">
          <Lock size={32} className="text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">{isSettingPin ? "Create Vault PIN" : "Unlock Vault"}</h2>
          <p className="text-xs text-white/40 mt-1">{isSettingPin ? "Choose a 4+ digit PIN to protect your passwords" : "Enter your PIN to access saved passwords"}</p>
        </div>

        <div className="w-64 space-y-3">
          <input type="password" value={pinInput} onChange={e => { setPinInput(e.target.value); setPinError(false); }}
            onKeyDown={e => e.key === "Enter" && (isSettingPin ? undefined : unlock())}
            placeholder={isSettingPin ? "New PIN (4+ digits)" : "Enter PIN"}
            className={`w-full rounded-xl bg-white/[0.06] px-4 py-3 text-center text-lg tracking-[0.5em] outline-none text-white border ${pinError ? "border-accent-pink" : "border-white/10"} focus:border-accent-blue`} />
          {isSettingPin && (
            <input type="password" value={pinConfirm} onChange={e => { setPinConfirm(e.target.value); setPinError(false); }}
              placeholder="Confirm PIN"
              className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-center text-lg tracking-[0.5em] outline-none text-white border border-white/10 focus:border-accent-blue" />
          )}
          {pinError && <p className="text-center text-xs text-accent-pink">{isSettingPin ? "PINs don't match" : "Incorrect PIN"}</p>}
          <button onClick={isSettingPin ? setupPin : unlock}
            className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple py-3 text-sm font-medium text-white transition hover:brightness-110">
            {isSettingPin ? "Create PIN" : <><Unlock size={14} className="inline mr-2"/>Unlock</>}
          </button>
        </div>
        <p className="text-[10px] text-white/20 text-center max-w-xs">Passwords are stored locally in your browser. For demo purposes only.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <ShieldCheck size={14} className="text-accent-green" />
        <span className="flex-1 text-xs text-white/60">{entries.length} saved passwords</span>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-accent-blue/20 px-3 py-1.5 text-xs text-accent-blue transition hover:bg-accent-blue/30">
          <Plus size={12}/> Add
        </button>
        <button onClick={() => setUnlocked(false)} className="text-white/30 hover:text-white/60 transition">
          <Lock size={14}/>
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-2 p-4">
              {(["site", "username", "password", "note"] as const).map(f => (
                <div key={f} className={f === "note" || f === "password" ? "col-span-2" : ""}>
                  <p className="mb-1 text-[10px] text-white/30 capitalize">{f}</p>
                  {f === "password" ? (
                    <div className="flex gap-2">
                      <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                        placeholder="••••••••" type="text"
                        className="flex-1 rounded-xl bg-white/[0.06] px-3 py-2 text-sm font-mono outline-none text-white/80 placeholder:text-white/20 border border-white/10 focus:border-accent-blue" />
                      <button onClick={() => setForm(p => ({ ...p, password: generatePassword() }))}
                        className="rounded-xl bg-white/10 px-3 py-2 text-[10px] text-white/50 hover:bg-white/15 transition whitespace-nowrap">
                        <Key size={12}/>
                      </button>
                    </div>
                  ) : (
                    <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                      placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                      className="w-full rounded-xl bg-white/[0.06] px-3 py-2 text-sm outline-none text-white/80 placeholder:text-white/20 border border-white/10 focus:border-accent-blue" />
                  )}
                </div>
              ))}
              {pw && (
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pwStrength.score >= 4 ? "bg-accent-green" : pwStrength.score >= 2 ? "bg-accent-amber" : "bg-accent-pink"}`}
                      style={{ width: `${(pwStrength.score / 5) * 100}%` }} />
                  </div>
                  <span className={`text-[10px] ${pwStrength.color}`}>{pwStrength.label}</span>
                </div>
              )}
              <div className="col-span-2 flex gap-2">
                <button onClick={addEntry} disabled={!form.site || !form.password}
                  className="flex-1 rounded-xl bg-accent-blue/20 py-2 text-xs text-accent-blue transition hover:bg-accent-blue/30 disabled:opacity-30">Save</button>
                <button onClick={() => setShowAdd(false)} className="rounded-xl bg-white/5 px-4 py-2 text-xs text-white/40 transition hover:bg-white/10">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {entries.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-white/20">
            <Key size={28}/><p className="text-sm">No passwords saved yet</p>
          </div>
        )}
        <AnimatePresence>
          {entries.map(e => (
            <motion.div key={e.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className="group flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 hover:bg-white/[0.03] transition">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue/30 to-accent-purple/30 text-xs font-bold text-white/70">
                {e.site.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{e.site}</p>
                <p className="text-[10px] text-white/35 truncate">{e.username || "No username"}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-white/30">
                  {showPassFor === e.id ? e.password : "••••••••"}
                </span>
                <button onClick={() => setShowPassFor(v => v === e.id ? null : e.id)}
                  className="text-white/20 hover:text-white/60 transition p-1">
                  {showPassFor === e.id ? <EyeOff size={12}/> : <Eye size={12}/>}
                </button>
                <button onClick={() => copyPw(e.password, e.id)}
                  className="text-white/20 hover:text-white/60 transition p-1">
                  {copied === e.id ? <Check size={12} className="text-accent-green"/> : <Copy size={12}/>}
                </button>
                <button onClick={() => setEntries(p => p.filter(x => x.id !== e.id))}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-accent-pink transition p-1">
                  <Trash2 size={12}/>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
