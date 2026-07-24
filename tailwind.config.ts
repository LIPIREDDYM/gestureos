import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.14)",
        },
        accent: {
          blue: "#0A84FF",
          purple: "#BF5AF2",
          pink: "#FF375F",
          teal: "#64D2FF",
          green: "#30D158",
          amber: "#FFD60A",
        },
        base: {
          950: "#050507",
          900: "#0A0A0F",
          800: "#101018",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.45)",
        glow: "0 0 40px rgba(10,132,255,0.35)",
        dock: "0 12px 40px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "aurora":
          "linear-gradient(120deg, #0A84FF 0%, #BF5AF2 45%, #FF375F 100%)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.4s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 3s linear infinite",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'Inter'",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
