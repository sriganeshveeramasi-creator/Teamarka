import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ["var(--font-brand)", "Outfit", "Montserrat", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        arka: {
          blue: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            500: "#0284c7",
            600: "#0369a1",
            700: "#075985",
          },
          cyan: {
            400: "#22d3ee",
            500: "#06b6d4",
          },
          green: {
            50: "#f0fdf4",
            100: "#dcfce7",
            500: "#10b981",
            600: "#059669",
          },
          purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            500: "#a855f7",
            600: "#9333ea",
          },
          orange: {
            50: "#fff7ed",
            100: "#ffedd5",
            500: "#f97316",
            600: "#ea580c",
          },
          amber: {
            500: "#f59e0b",
          },
          red: {
            50: "#fef2f2",
            500: "#ef4444",
            600: "#dc2626",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
