import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // MIND.AI blue wellness system — calm, intelligent and human.
        brand: {
          DEFAULT: "#4056C8", // indigo blue — primary actions, links, active states
          dark: "#2F419F", // hover / pressed
          light: "#8494E8", // muted periwinkle — illustration fills, soft accents
        },
        sage: "#DCE5FF", // powder blue — section bands, large fills
        cream: {
          DEFAULT: "#F5F7FF", // ice blue — page ground, section bands
          alt: "#FCFDFF", // off-white — cards / content surfaces
        },
        earth: "#64708D", // secondary text / muted accent
        ink: "#17213E", // midnight text / footer ground
        crisis: {
          DEFAULT: "#B23B2E", // high-contrast alert — SOS, form errors
          dark: "#8F2C21",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 33, 62, 0.04), 0 12px 32px -16px rgba(23, 33, 62, 0.16)",
        soft: "0 1px 2px rgba(23, 33, 62, 0.04), 0 6px 18px -10px rgba(23, 33, 62, 0.12)",
        pill: "0 10px 28px -8px rgba(178, 59, 46, 0.4)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // 12s cycle matching the calming exercise's 4s inhale / 2s hold /
        // 6s exhale: grows for the first third, holds through the next
        // sixth, shrinks over the remaining half.
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "33.33%": { transform: "scale(1.15)" },
          "50%": { transform: "scale(1.15)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        breathe: "breathe 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
