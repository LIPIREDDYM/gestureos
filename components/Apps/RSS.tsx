"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, RefreshCw, ExternalLink, Plus, Trash2, Loader2 } from "lucide-react";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

interface Feed {
  id: string;
  url: string;
  label: string;
  color: string;
}

const DEFAULT_FEEDS: Feed[] = [
  { id: "1", url: "https://hnrss.org/frontpage", label: "Hacker News", color: "bg-accent-amber" },
  { id: "2", url: "https://feeds.feedburner.com/TechCrunch", label: "TechCrunch", color: "bg-accent-blue" },
  { id: "3", url: "https://www.theverge.com/rss/index.xml", label: "The Verge", color: "bg-accent-purple" },
];

const CORS_PROXY = "https://api.allorigins.win/get?url=";

function parseFeed(xml: string, source: string): FeedItem[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const items = Array.from(doc.querySelectorAll("item, entry")).slice(0, 10);
    return items.map(item => ({
      title: item.querySelector("title")?.textContent?.trim() ?? "Untitled",
      link: item.querySelector("link")?.textContent?.trim() ?? item.querySelector("link")?.getAttribute("href") ?? "#",
      pubDate: item.querySelector("pubDate, published, updated")?.textContent?.trim() ?? "",
      description: (item.querySelector("description, summary")?.textContent ?? "").replace(/<[^>]*>/g, "").slice(0, 140),
      source,
    }));
  } catch { return []; }
}

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch { return ""; }
}

const STORAGE_KEY = "gestureos:rss:feeds";

export function RSS() {
  const [feeds, setFeeds] = useState<Feed[]>(DEFAULT_FEEDS);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFeed, setActiveFeed] = useState<string | null>(null); // null = all
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) setFeeds(JSON.parse(r)); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds)); } catch {}
  }, [feeds]);

  const fetchAll = async (feedList = feeds) => {
    setLoading(true);
    const COLORS = ["bg-accent-blue", "bg-accent-purple", "bg-accent-pink", "bg-accent-green", "bg-accent-amber"];
    const results: FeedItem[] = [];
    await Promise.allSettled(
      feedList.map(async (feed) => {
        try {
          const res = await fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}`);
          const json = await res.json();
          const parsed = parseFeed(json.contents, feed.label);
          results.push(...parsed);
        } catch {}
      })
    );
    results.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    setItems(results);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const addFeed = () => {
    if (!newUrl.trim()) return;
    const COLORS = ["bg-accent-blue", "bg-accent-purple", "bg-accent-pink", "bg-accent-green", "bg-accent-amber"];
    const feed: Feed = {
      id: String(Date.now()),
      url: newUrl.trim(),
      label: newLabel.trim() || new URL(newUrl).hostname,
      color: COLORS[feeds.length % COLORS.length],
    };
    const next = [...feeds, feed];
    setFeeds(next);
    setNewUrl(""); setNewLabel(""); setShowAdd(false);
    fetchAll(next);
  };

  const removeFeed = (id: string) => {
    setFeeds(prev => prev.filter(f => f.id !== id));
    setItems(prev => prev.filter(i => {
      const feed = feeds.find(f => f.id === id);
      return feed ? i.source !== feed.label : true;
    }));
  };

  const visible = activeFeed
    ? items.filter(i => i.source === feeds.find(f => f.id === activeFeed)?.label)
    : items;

  return (
    <div className="flex h-full flex-col">
      {/* Feed selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/10 px-3 py-2 no-scrollbar">
        <button onClick={() => setActiveFeed(null)}
          className={`shrink-0 rounded-xl px-3 py-1.5 text-[10px] font-medium transition ${!activeFeed ? "bg-white/15 text-white" : "text-white/40 hover:bg-white/5"}`}>
          All ({items.length})
        </button>
        {feeds.map(f => (
          <button key={f.id} onClick={() => setActiveFeed(f.id)}
            className={`group relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] transition ${activeFeed === f.id ? "bg-white/15 text-white" : "text-white/40 hover:bg-white/5"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${f.color}`} />
            {f.label}
            <button onClick={(e) => { e.stopPropagation(); removeFeed(f.id); }}
              className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-accent-pink transition text-white/30">
              <Trash2 size={9} />
            </button>
          </button>
        ))}
        <button onClick={() => setShowAdd(v => !v)}
          className="shrink-0 flex items-center gap-1 rounded-xl bg-white/5 px-2.5 py-1.5 text-[10px] text-white/40 hover:bg-white/10 transition">
          <Plus size={10} /> Add
        </button>
        <button onClick={() => fetchAll()} disabled={loading}
          className="ml-auto shrink-0 text-white/30 hover:text-white/60 transition disabled:opacity-30">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Add feed form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 bg-white/[0.02]">
            <div className="flex gap-2 p-3">
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com/feed.xml"
                className="flex-1 rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-white/70 outline-none border border-white/10 focus:border-accent-blue placeholder:text-white/20" />
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label"
                className="w-24 rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-white/70 outline-none border border-white/10 focus:border-accent-blue placeholder:text-white/20" />
              <button onClick={addFeed}
                className="rounded-xl bg-accent-blue/20 px-3 py-2 text-xs text-accent-blue hover:bg-accent-blue/30 transition">Add</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading && items.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-16 text-white/30">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading feeds…</span>
          </div>
        )}
        <AnimatePresence>
          {visible.map((item, i) => {
            const feedColor = feeds.find(f => f.label === item.source)?.color ?? "bg-white/20";
            return (
              <motion.a key={`${item.link}-${i}`} href={item.link} target="_blank" rel="noreferrer"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="group flex gap-3 border-b border-white/[0.04] px-4 py-3 hover:bg-white/[0.04] transition">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${feedColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85 leading-tight line-clamp-2 group-hover:text-white transition">{item.title}</p>
                  {item.description && (
                    <p className="mt-0.5 text-[10px] text-white/35 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[9px] text-white/25">
                    <span>{item.source}</span>
                    {item.pubDate && <><span>·</span><span>{timeAgo(item.pubDate)}</span></>}
                  </div>
                </div>
                <ExternalLink size={12} className="mt-1 shrink-0 text-white/20 opacity-0 group-hover:opacity-100 transition" />
              </motion.a>
            );
          })}
        </AnimatePresence>
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-white/20">
            <Rss size={24} /><p className="text-sm">No articles loaded</p>
            <button onClick={() => fetchAll()} className="text-xs text-accent-blue hover:underline">Retry</button>
          </div>
        )}
        {lastRefresh && (
          <p className="py-3 text-center text-[9px] text-white/15">
            Last updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}
