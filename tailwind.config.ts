import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * AwSales Design System — Tailwind bindings.
 *
 * Brand scales exposed under the `aw-*` prefix (aw-gray, aw-blue, aw-emerald,
 * aw-red, aw-purple, aw-teal, aw-amber, aw-pink, aw-lime, aw-slate) and
 * semantic tokens (bg, fg, border, accent) that track the CSS custom
 * properties in `app/globals.css`. Legacy aliases are kept so the existing
 * component tree keeps rendering during the rollout.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // AwSales gray — structure / hardware scale
        "aw-gray": {
          150: "#F9F9F9",
          200: "#F2F2F2",
          300: "#E5E5E5",
          400: "#D1D1D1",
          500: "#B8B8B8",
          600: "#999999",
          700: "#7A7A7A",
          800: "#5E5E5E",
          900: "#454545",
          1000: "#2F2F2F",
          1100: "#1A1A1A",
          1200: "#0D0D0D",
        },
        // AwSales blue — origin of the AI gradient spectrum
        "aw-blue": {
          100: "#F2F7FF",
          150: "#E8F0FF",
          200: "#DDEBFF",
          300: "#B8D4FF",
          400: "#8FB8FF",
          500: "#478AFF",
          600: "#2F76E6",
          700: "#1A5EC8",
          800: "#1346A2",
          900: "#0D317A",
          1000: "#09225A",
          1100: "#06163D",
          1200: "#030D25",
        },
        "aw-emerald": {
          100: "#F2FBF5",
          150: "#E8F9ED",
          200: "#DDF7E5",
          300: "#BFF2D0",
          400: "#99EBB8",
          500: "#5BDF9E",
          600: "#40C987",
          700: "#22A871",
          800: "#17825A",
          900: "#105E45",
          1000: "#0A4230",
          1100: "#062B1F",
          1200: "#041912",
        },
        "aw-red": {
          100: "#FFF2F2",
          150: "#FDE6E6",
          200: "#FDDDDD",
          300: "#FBBFBF",
          400: "#F29999",
          500: "#DF5B5B",
          600: "#C94040",
          700: "#A82222",
          800: "#821718",
          900: "#5E1010",
          1000: "#420A0A",
          1100: "#2B0606",
          1200: "#190404",
        },
        "aw-purple": {
          100: "#F7F2FC",
          150: "#F0E7FA",
          200: "#EADDF8",
          300: "#DBBFF2",
          400: "#C499EB",
          500: "#9E5BDF",
          600: "#8740C9",
          700: "#7122A8",
          800: "#5A1782",
          900: "#45105E",
          1000: "#300A42",
        },
        "aw-teal": {
          100: "#DFF7F6",
          200: "#A1E6E6",
          400: "#64D4D7",
          500: "#45CCCF",
          600: "#26C3C7",
          700: "#20B2B4",
          900: "#16908F",
        },
        "aw-amber": {
          100: "#FFF7ED",
          150: "#FDEFD9",
          200: "#FDE6CC",
          300: "#FCD4A3",
          400: "#F2A95B",
          500: "#E6762F",
          600: "#CC5F1E",
          700: "#B05315",
          800: "#8C4112",
          900: "#7A3A10",
          1000: "#54270A",
          1100: "#331806",
          1200: "#1F0E03",
        },
        "aw-pink": {
          100: "#FDF2F8",
          200: "#FCE3EE",
          300: "#F9C4DB",
          400: "#F490B5",
          500: "#E85C91",
          600: "#D13F76",
          700: "#A82A5C",
          800: "#801F46",
          900: "#5A1530",
          1000: "#3B0D20",
          1200: "#1A0610",
        },
        "aw-lime": {
          100: "#F4FBE5",
          200: "#E4F5BE",
          400: "#BDE862",
          500: "#A1D136",
          600: "#7FAB25",
          700: "#5F8018",
          900: "#354811",
          1200: "#111706",
        },
        "aw-slate": {
          100: "#F4F6F8",
          200: "#E4E8EE",
          300: "#C9D0DA",
          400: "#9FA9BA",
          500: "#7886A0",
          600: "#5D6A82",
          700: "#465267",
          800: "#333D4D",
          900: "#222A36",
          1000: "#141922",
          1200: "#080A0E",
        },
        // Semantic tokens — point at CSS vars so dark mode / theming can
        // reassign them without rebuilding Tailwind.
        bg: {
          canvas: "var(--bg-canvas)",
          surface: "var(--bg-surface)",
          raised: "var(--bg-raised)",
          muted: "var(--bg-muted)",
          inverse: "var(--bg-inverse)",
        },
        fg: {
          primary: "var(--fg-primary)",
          secondary: "var(--fg-secondary)",
          tertiary: "var(--fg-tertiary)",
          muted: "var(--fg-muted)",
          "on-inverse": "var(--fg-on-inverse)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          inverse: "var(--border-inverse)",
        },
        brand: {
          DEFAULT: "var(--accent-brand)",
          hover: "var(--accent-brand-hover)",
        },
        // Legacy aliases — kept so existing `bg-sidebar-bg`, `text-text-primary`
        // etc. keep compiling while components migrate to the new tokens.
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
          bg: "#0d0d0d",
          border: "#1a1a1a",
          hover: "#1a1a1a",
          active: "#2f2f2f",
        },
        success: {
          DEFAULT: "#22A871",
          light: "#40C987",
        },
        accent: {
          green: "#A1D136",
        },
        chart: {
          blue: "#478AFF",
          red: "#DF5B5B",
        },
      },
      fontFamily: {
        sans: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        heading: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.06)",
        sm: "0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        md: "0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
        lg: "0 12px 32px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04)",
        overlay: "0 24px 64px rgba(0, 0, 0, 0.18)",
      },
      transitionTimingFunction: {
        "aw-out": "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        "aw-fast": "120ms",
        "aw-base": "180ms",
        "aw-slow": "280ms",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        fadeInUp: "fadeInUp .35s cubic-bezier(.22,.8,.3,1)",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
