import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bleu principal de l'app
        primary: {
          DEFAULT: "#1D4ED8",
          50: "#EFF4FF",
          100: "#DBE6FE",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(15, 23, 42, 0.08)",
        card: "0 4px 24px rgba(15, 23, 42, 0.10)",
      },
      keyframes: {
        "promo-pulse": {
          "0%, 100%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(249,115,22,0.6))" },
          "50%": { transform: "scale(1.18)", filter: "drop-shadow(0 0 8px rgba(249,115,22,0.9))" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "promo-pulse": "promo-pulse 1.4s ease-in-out infinite",
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
