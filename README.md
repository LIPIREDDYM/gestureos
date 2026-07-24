# GestureOS

A futuristic, Apple-inspired desktop UI you control with hand gestures via your webcam — built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and MediaPipe Hands.

## Requirements

- **Node.js 18.17+** (Node 20 LTS recommended)
- A laptop with a **webcam**
- A Chromium-based browser (Chrome/Edge) or Safari/Firefox — anything with `getUserMedia` support
- Internet access on first run (MediaPipe's WASM/model files load from a CDN)

## 1. Install Node.js (if you don't have it)

Check first:
```bash
node -v
```
If that fails or shows < 18, install Node from https://nodejs.org (LTS version), or via a version manager:
```bash
# macOS (Homebrew)
brew install node

# Windows: download the installer from nodejs.org
```

## 2. Install dependencies

Open a terminal in the project folder (the one with `package.json`) and run:
```bash
npm install
```
This pulls in Next.js, React, Tailwind, Framer Motion, MediaPipe, Zustand, etc.

## 3. Run it

```bash
npm run dev
```
Then open **http://localhost:3000** in your browser.

## 4. Grant camera access

Click **"Enable Gesture Control"** in the bottom-right corner. Your browser will prompt for camera permission — click **Allow**. Give it 1–2 seconds to load the MediaPipe hand-tracking model, then hold your hand up in frame.

> Camera access requires a "secure context." `localhost` counts as secure, so this works out of the box. If you later deploy it, you'll need HTTPS.

## Gestures

| Gesture | Action |
|---|---|
| ✋ Open Palm | Opens/closes the App Launcher |
| 🤏 Pinch (thumb + index) | Acts as a mouse click at your fingertip position |
| 👈 Swipe Left | Previous page |
| 👉 Swipe Right | Next page |
| 👍 Thumbs Up | Save (shows a confirmation toast) |
| ✌️ Peace Sign | Opens the AI Assistant |

The HUD in the top-left shows the currently detected gesture, its confidence, tracking FPS, and camera status. A small preview in the bottom-right shows your hand skeleton and highlighted fingertips live.

## Troubleshooting

- **"Camera access denied"** — you likely clicked Block. Go to your browser's site settings (click the padlock icon in the address bar) and re-allow the camera for `localhost:3000`, then reload.
- **Gestures feel unreliable** — make sure you're in decent lighting, your whole hand is in frame, and you're not too close/far from the camera. The pinch/swipe thresholds are tuned in `types/gesture.ts` (`DEFAULT_GESTURE_CONFIG`) if you want to tweak sensitivity.
- **Low FPS** — MediaPipe is CPU/GPU intensive. Close other heavy tabs/apps, or lower `modelComplexity` in `lib/mediapipe/handsSetup.ts` from `1` to `0`.
- **Blank page / build errors** — delete `node_modules` and `.next`, then `npm install` again:
  ```bash
  rm -rf node_modules .next
  npm install
  npm run dev
  ```

## Project structure

```
app/                  Next.js App Router entry (layout, page, globals.css)
components/
  Apps/               The 6 mock desktop apps (Notes, Music, Weather, Calculator, Gallery, AIAssistant)
  Desktop/             Wallpaper, MenuBar, Dock, Launcher, Desktop (top-level composition)
  Gesture/             CameraFeed (skeleton overlay), GestureHUD, GestureCursor
  Windows/             Window (draggable/resizable chrome), WindowManager
  UI/                  GlassPanel, StatusBadge — shared design primitives
hooks/                 useHandTracking, useGestureRecognition, useWindowManager, useFPS
lib/
  ai/aiClient.ts       Mock AI responses — swap this for a real LLM call, see comments inside
  gestures/            Pure gesture-scoring functions (open palm, pinch, thumbs up, etc.)
  mediapipe/           MediaPipe Hands loader/wrapper
types/                 Shared TypeScript types (hand, gesture, window)
utils/                 cn() class merger, math helpers (distance, EMA smoothing)
```

## Swapping in a real AI model

`lib/ai/aiClient.ts` exports `sendMessage(messages)`. Replace its body with a `fetch` to a server route (e.g. `app/api/assistant/route.ts`) that calls Anthropic/OpenAI/Gemini with a server-side API key. The `AIAssistant` component doesn't need any changes as long as the function signature stays the same.

## Notes on this build

- No backend — everything (Notes, Music, Weather, Gallery data) is mock/local state so the app runs standalone.
- Gallery images are CSS gradients, not fetched photos, so it works fully offline once the page has loaded.
- Gesture confidence scoring lives in `lib/gestures/gestureDetectors.ts`, heavily commented — a good starting point if you want to add new gestures.
