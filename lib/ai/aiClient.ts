/**
 * AI client abstraction.
 *
 * Today this returns canned, topic-matched responses so the AI Assistant
 * app works fully offline/without API keys. To wire up a real model:
 *
 *   1. Implement `sendMessage` to call your provider, e.g.
 *        const res = await fetch("/api/assistant", {
 *          method: "POST",
 *          body: JSON.stringify({ messages }),
 *        });
 *      and create a matching `app/api/assistant/route.ts` that calls
 *      Anthropic/OpenAI/Gemini with your server-side API key.
 *   2. Keep the `AiMessage` / `AiResponse` shapes the same so the
 *      AIAssistant component doesn't need to change at all.
 */

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiResponse {
  content: string;
}

const MOCK_LIBRARY: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["hello", "hi", "hey"],
    reply: "Hey there! I'm your GestureOS assistant. Try asking me about the weather, your notes, or how gestures work.",
  },
  {
    keywords: ["gesture", "gestures"],
    reply:
      "I recognize six gestures: open palm to launch apps, pinch to click, swipe left/right to navigate, thumbs up to save, and a peace sign to summon me.",
  },
  {
    keywords: ["weather"],
    reply: "It's a crisp 22°C with clear skies right now — perfect for a walk. Check the Weather app for the full forecast.",
  },
  {
    keywords: ["note", "notes"],
    reply: "You can open the Notes app from the dock or with an open-palm gesture. I can help you draft one if you'd like.",
  },
  {
    keywords: ["music", "song", "play"],
    reply: "Queuing up something smooth. Open the Music app to see the full player and control playback.",
  },
  {
    keywords: ["thanks", "thank you"],
    reply: "Anytime! That's what I'm here for.",
  },
];

const FALLBACK_REPLIES = [
  "That's a great question — once I'm connected to a real model, I'll be able to dig much deeper into this.",
  "I'm running in simulation mode right now, but I hear you loud and clear. Try wiring me up to Gemini or OpenAI for the full experience.",
  "Interesting! I'm currently a mock assistant, but the plumbing is ready for a real LLM whenever you are.",
];

function pickMockReply(userText: string): string {
  const lower = userText.toLowerCase();
  for (const entry of MOCK_LIBRARY) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.reply;
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

/** Simulated network latency so the UI's loading state feels real. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendMessage(messages: AiMessage[]): Promise<AiResponse> {
  const last = messages[messages.length - 1];
  await delay(500 + Math.random() * 600);
  return { content: pickMockReply(last?.content ?? "") };
}
