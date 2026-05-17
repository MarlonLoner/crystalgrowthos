import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#07080c",
        graphite: "#11131a",
        ember: "#ff8a1f",
        aurum: "#f6c453",
        champagne: "#f7e7c4",
        mercury: "#b8bfcc"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(246,196,83,0.14), 0 18px 80px rgba(255,138,31,0.12)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
