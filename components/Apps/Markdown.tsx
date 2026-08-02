"use client";

import { useState } from "react";
import { Eye, Edit3 } from "lucide-react";

const DEFAULT_MD = `# Welcome to GestureOS Markdown

## Features
- **Bold**, *italic*, \`inline code\`
- Ordered and unordered lists
- Code blocks with syntax highlighting
- Headings H1–H6
- Horizontal rules

## Gestures Quick Reference
| Gesture | Action |
|---------|--------|
| ✋ Open Palm | Launcher |
| 🤏 Pinch | Click |
| ✌️ Peace Sign | Spotlight |
| 👊 Fist | Close window |
| 👍 Thumbs Up | Save |

## Code Example
\`\`\`typescript
function detectOpenPalm(fingers: FingerState): number {
  const avg = (fingers.index + fingers.middle +
    fingers.ring + fingers.pinky) / 4;
  return Math.min(1, avg * 1.2);
}
\`\`\`

---

> "The best interface is no interface." — Golden Krishna
`;

/** Minimal markdown → HTML renderer (no dependencies) */
function renderMarkdown(md: string): string {
  return md
    // Headings
    .replace(/^###### (.+)$/gm, '<h6 class="text-xs font-semibold text-white/60 mt-3 mb-1">$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5 class="text-sm font-semibold text-white/70 mt-3 mb-1">$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-sm font-bold text-white/80 mt-4 mb-1">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-white/85 mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-5 mb-2 border-b border-white/10 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gradient-aurora mt-4 mb-3">$1</h1>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-white/10 my-4" />')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="rounded-xl bg-white/[0.06] border border-white/10 p-4 overflow-x-auto text-xs text-accent-green font-mono my-3"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-accent-teal">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-white/80 italic">$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-accent-purple/60 pl-4 text-white/50 italic my-2">$1</blockquote>')
    // Table header
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.slice(1, -1).split("|").map(c => c.trim());
      const isHeader = !cells.every(c => /^[-:]+$/.test(c));
      if (!isHeader) return "";
      return `<tr>${cells.map(c => `<th class="px-3 py-1.5 text-left text-xs font-semibold text-white/70 border-b border-white/10">${c}</th>`).join("")}</tr>`;
    })
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-white/70 list-disc">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-white/70 list-decimal">$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="text-white/65 leading-relaxed my-2">')
    .replace(/\n/g, ' ');
}

export function Markdown() {
  const [content, setContent] = useState(DEFAULT_MD);
  const [mode, setMode] = useState<"preview" | "edit">("preview");

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex-1 text-xs text-white/40">Markdown Viewer</span>
        <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition ${mode === "preview" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            <Eye size={11} /> Preview
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition ${mode === "edit" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            <Edit3 size={11} /> Edit
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 resize-none bg-black/20 p-4 font-mono text-xs leading-relaxed text-white/70 outline-none no-scrollbar"
          spellCheck={false}
        />
      ) : (
        <div
          className="flex-1 overflow-y-auto p-5 text-sm no-scrollbar"
          dangerouslySetInnerHTML={{
            __html: `<p class="text-white/65 leading-relaxed my-2">${renderMarkdown(content)}</p>`,
          }}
        />
      )}
    </div>
  );
}
