import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GestureOS — Control your desktop with your hands",
  description:
    "A futuristic, gesture-controlled operating system UI powered by real-time hand tracking in the browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="h-full w-full font-sans antialiased text-white selection:bg-accent-blue/40">
        {children}
      </body>
    </html>
  );
}
