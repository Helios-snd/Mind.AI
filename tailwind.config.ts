import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // MIND.AI sage / olive / warm-cream system — a calm, non-clinical palette.
        brand: {
          DEFAULT: "#56663A", // deep olive — primary actions, links, active states
          dark: "#3F4A2B", // hover / pressed
          light: "#87945A", // muted sage — illustration fills, soft accents
        },
        sage: "#D9DCA8", // soft sage — section bands, large fills
        cream: {
          DEFAULT: "#F5EBD7", // warm cream — page ground, section bands
          alt: "#FCF8EE", // off-white — cards / content surfaces
        },
        earth: "#6B6250", // secondary text / muted accent
        ink: "#2F3325", // darkest text / footer ground
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
        card: "0 1px 2px rgba(47, 51, 37, 0.04), 0 12px 32px -16px rgba(47, 51, 37, 0.14)",
        soft: "0 1px 2px rgba(47, 51, 37, 0.04), 0 6px 18px -10px rgba(47, 51, 37, 0.12)",
        pill: "0 10px 28px -8px rgba(178, 59, 46, 0.4)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
