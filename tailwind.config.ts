import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          1200: "#0d0d0d",
        },
        primary: {
          default: "#252b33",
          dark: "#162d3a",
        },
        text: {
          primary: "#0c1421",
          secondary: "#8897ad",
        },
        input: {
          bg: "#f5f5f5",
          border: "#e5e5e5",
        },
        sidebar: {
          bg: "#1a1a1a",
          border: "#242424",
          hover: "#242424",
          active: "#242424",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
        },
        accent: {
          green: "#9dd920",
        },
        chart: {
          blue: "#3b82f6",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
