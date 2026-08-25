import {heroui} from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      animation: {
        sheen: "sheen 6s linear infinite",
        blink: "blink 1.1s steps(1) infinite",
        riseIn: "riseIn 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        typeIn: "typeIn 0.4s ease forwards",
      },
      keyframes: {
        sheen: {
          "to": { "background-position": "-300% 0" },
        },
        blink: {
          "50%": { opacity: "0" },
        },
        riseIn: {
          "from": { opacity: "0", transform: "translateY(16px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        typeIn: {
          "from": { opacity: "0", transform: "translateX(-10px)" },
          "to": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
