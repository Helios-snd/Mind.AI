import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Sampled from the live rezen.in build
        brand: {
          DEFAULT: "#F0703A",
          dark: "#CC6235",
          light: "#F8946B",
        },
        cream: {
          DEFAULT: "#FFF5EA",
          alt: "#FFF7E9",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
