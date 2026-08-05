"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw, ChevronLeft, ChevronRight, Check, X, Pencil } from "lucide-react";

interface Card {
  id: string;
  front: string;
  back: string;
  nextReview: number; // timestamp
  interval: number; // days
  easeFactor: number; // SM-2
  reps: number;
}

interface Deck {
  id: string;
  name: string;
  color: string;
  cards: Card[];
}

const COLORS = [
  "from-accent-blue to-accent-purple",
  "from-accent-green to-accent-teal",
  "from-accent-pink to-accent-amber",
  "from-accent-purple to-accent-blue",
];

const STORAGE_KEY = "gestureos:flashcards";

function createCard(front: string, back: string): Card {
  return { id: String(Date.now() + Math.random()), front, back, nextReview: Date.now(), interval: 1, easeFactor: 2.5, reps: 0 };
}

// SM-2 algorithm
function reviewCard(card: Card, quality: 0 | 1 | 2 | 3 | 4 | 5): Card {
  let { easeFactor, interval, reps } = card;
  if (quality < 3) { reps = 0; interval = 1; }
  else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    reps++;
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return { ...card, easeFactor, interval, reps, nextReview: Date.now() + interval * 86400000 };
}

const INITIAL_DECKS: Deck[] = [
  {
    id: "1", name: "GestureOS", color: COLORS[0], cards: [
      createCard("What gesture opens the launcher?", "Open Palm ✋"),
      createCard("What gesture clicks elements?", "Pinch 🤏"),
      createCard("What gesture closes a window?", "Fist 👊"),
      createCard("What gesture opens Spotlight?", "Peace Sign ✌️"),
    ],
  },
  {
    id: "2", name: "General", color: COLORS[1], cards: [
      createCard("What does EMA stand for?", "Exponential Moving Average"),
      createCard("What is MediaPipe?", "Google's ML framework for real-time perception tasks"),
    ],
  },
];

export function Flashcards() {
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState<"deck" | "card" | null>(null);
  const [newDeckName, setNewDeckName] = useState("");
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) setDecks(JSON.parse(r)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(decks)); } catch {}
  }, [decks]);

  const activeDeck = decks.find(d => d.id === activeDeckId);
  const dueCards = activeDeck?.cards.filter(c => c.nextReview <= Date.now()) ?? [];
  const studyCard = dueCards[cardIdx];

  const rate = (q: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!studyCard || !activeDeckId) return;
    const updated = reviewCard(studyCard, q);
    setDecks(prev => prev.map(d => d.id !== activeDeckId ? d : {
      ...d, cards: d.cards.map(c => c.id === studyCard.id ? updated : c),
    }));
    if (cardIdx < dueCards.length - 1) { setCardIdx(i => i + 1); setFlipped(false); }
    else { setStudyMode(false); setCardIdx(0); }
  };

  const addDeck = () => {
    if (!newDeckName.trim()) return;
    setDecks(prev => [...prev, { id: String(Date.now()), name: newDeckName.trim(), color: COLORS[prev.length % COLORS.length], cards: [] }]);
    setNewDeckName(""); setShowAdd(null);
  };

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim() || !activeDeckId) return;
    setDecks(prev => prev.map(d => d.id !== activeDeckId ? d : { ...d, cards: [...d.cards, createCard(newFront.trim(), newBack.trim())] }));
    setNewFront(""); setNewBack(""); setShowAdd(null);
  };

  // Deck list
  if (!activeDeckId) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span className="text-xs text-white/50">My Decks</span>
          <button onClick={() => setShowAdd("deck")}
            className="flex items-center gap-1.5 rounded-xl bg-accent-blue/20 px-3 py-1.5 text-xs text-accent-blue hover:bg-accent-blue/30 transition">
            <Plus size={12} /> New Deck
          </button>
        </div>
        <AnimatePresence>
          {showAdd === "deck" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/10 bg-white/[0.02]">
              <div className="flex gap-2 p-3">
                <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="Deck name"
                  onKeyDown={e => e.key === "Enter" && addDeck()}
                  autoFocus className="flex-1 rounded-xl bg-white/[0.06] px-3 py-2 text-sm outline-none text-white/70 border border-white/10 focus:border-accent-blue placeholder:text-white/20" />
                <button onClick={addDeck} className="rounded-xl bg-accent-blue/20 px-3 py-2 text-xs text-accent-blue hover:bg-accent-blue/30 transition">Create</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar grid grid-cols-2 gap-3 content-start">
          {decks.map((deck, i) => {
            const due = deck.cards.filter(c => c.nextReview <= Date.now()).length;
            return (
              <motion.button key={deck.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setActiveDeckId(deck.id)}
                className="flex flex-col rounded-2xl bg-white/[0.05] border border-white/10 p-4 text-left hover:border-white/20 transition group">
                <div className={`mb-3 h-8 w-8 rounded-xl bg-gradient-to-br ${deck.color}`} />
                <p className="text-sm font-medium text-white/80">{deck.name}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{deck.cards.length} cards</p>
                {due > 0 && (
                  <span className="mt-2 self-start rounded-lg bg-accent-blue/20 px-2 py-0.5 text-[9px] text-accent-blue">{due} due</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Deck detail / study
  if (studyMode && studyCard) {
    return (
      <div className="flex h-full flex-col items-center justify-between p-6">
        <div className="flex w-full items-center justify-between">
          <button onClick={() => { setStudyMode(false); setCardIdx(0); setFlipped(false); }}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition">
            <ChevronLeft size={14} /> Back
          </button>
          <span className="text-xs text-white/40">{cardIdx + 1} / {dueCards.length}</span>
        </div>

        {/* Card */}
        <div className="w-full flex-1 flex items-center justify-center perspective-1000">
          <motion.div
            className="relative w-full max-w-sm cursor-pointer"
            style={{ height: 200 }}
            onClick={() => setFlipped(v => !v)}
          >
            <AnimatePresence mode="wait">
              <motion.div key={flipped ? "back" : "front"}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex h-full w-full flex-col items-center justify-center rounded-2xl border p-6 text-center ${flipped ? "border-accent-green/30 bg-accent-green/10" : "border-white/15 bg-white/[0.06]"}`}
              >
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">{flipped ? "Answer" : "Question"}</p>
                <p className="text-lg font-medium text-white leading-relaxed">{flipped ? studyCard.back : studyCard.front}</p>
                {!flipped && <p className="mt-4 text-[10px] text-white/25">Tap to reveal answer</p>}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Rating buttons */}
        {flipped ? (
          <div className="flex w-full gap-2">
            {([
              { q: 1 as const, label: "Again", color: "bg-accent-pink/20 text-accent-pink hover:bg-accent-pink/30" },
              { q: 3 as const, label: "Hard", color: "bg-accent-amber/20 text-accent-amber hover:bg-accent-amber/30" },
              { q: 4 as const, label: "Good", color: "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30" },
              { q: 5 as const, label: "Easy", color: "bg-accent-green/20 text-accent-green hover:bg-accent-green/30" },
            ]).map(({ q, label, color }) => (
              <button key={q} onClick={() => rate(q)} className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition ${color}`}>{label}</button>
            ))}
          </div>
        ) : (
          <div className="h-10" />
        )}
      </div>
    );
  }

  // Deck detail
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <button onClick={() => setActiveDeckId(null)} className="text-white/40 hover:text-white/70 transition">
          <ChevronLeft size={16} />
        </button>
        <span className="flex-1 text-sm font-medium text-white/80">{activeDeck?.name}</span>
        <button onClick={() => setShowAdd("card")}
          className="flex items-center gap-1.5 rounded-xl bg-white/5 px-2.5 py-1.5 text-[10px] text-white/50 hover:bg-white/10 transition">
          <Plus size={10} /> Card
        </button>
        {dueCards.length > 0 && (
          <button onClick={() => { setStudyMode(true); setCardIdx(0); setFlipped(false); }}
            className="rounded-xl bg-accent-blue/20 px-3 py-1.5 text-xs text-accent-blue hover:bg-accent-blue/30 transition">
            Study {dueCards.length} due
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAdd === "card" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-2 p-3">
              <textarea value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="Front (question)"
                className="rounded-xl bg-white/[0.06] p-3 text-xs text-white/70 outline-none resize-none h-16 border border-white/10 focus:border-accent-blue placeholder:text-white/20" />
              <textarea value={newBack} onChange={e => setNewBack(e.target.value)} placeholder="Back (answer)"
                className="rounded-xl bg-white/[0.06] p-3 text-xs text-white/70 outline-none resize-none h-16 border border-white/10 focus:border-accent-blue placeholder:text-white/20" />
              <button onClick={addCard} className="col-span-2 rounded-xl bg-accent-blue/20 py-2 text-xs text-accent-blue hover:bg-accent-blue/30 transition">Add Card</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeDeck?.cards.map((card, i) => (
          <div key={card.id} className="group flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 hover:bg-white/[0.03] transition">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80 font-medium truncate">{card.front}</p>
              <p className="text-[10px] text-white/40 truncate">{card.back}</p>
            </div>
            <div className="shrink-0 text-[9px] text-white/25">
              {card.reps > 0 ? `${card.interval}d` : "New"}
            </div>
            <button onClick={() => setDecks(prev => prev.map(d => d.id !== activeDeckId ? d : { ...d, cards: d.cards.filter(c => c.id !== card.id) }))}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition text-white/20 hover:text-accent-pink">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {activeDeck?.cards.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-white/20">
            <Pencil size={22} /><p className="text-sm">No cards yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
