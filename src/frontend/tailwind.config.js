import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
        "night-sm": "0 8px 24px -12px oklch(0.06 0.003 265 / 0.9)",
        "night-md": "0 20px 48px -24px oklch(0.06 0.003 265 / 0.95)",
        "night-lg": "0 40px 90px -40px oklch(0.06 0.003 265 / 1)",
        "glass": "0 24px 60px -30px oklch(0.06 0.003 265 / 0.9), inset 0 1px 0 0 oklch(0.99 0.004 250 / 0.07)",
        "edge-blue": "0 0 0 1px oklch(0.58 0.2 258 / 0.32), 0 14px 40px -18px oklch(0.58 0.2 258 / 0.5)",
        "edge-cyan": "0 0 0 1px oklch(0.85 0.13 205 / 0.32), 0 14px 40px -18px oklch(0.85 0.13 205 / 0.45)",
        "stage": "0 -20px 80px -30px oklch(0.85 0.13 205 / 0.35)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            opacity: "0.55",
            boxShadow: "0 0 0 0 oklch(0.85 0.13 205 / 0.35)",
          },
          "50%": {
            opacity: "1",
            boxShadow: "0 0 42px 6px oklch(0.85 0.13 205 / 0.28)",
          },
        },
        "qr-reveal": {
          from: {
            opacity: "0",
            transform: "scale(0.9)",
            filter: "blur(10px)",
          },
          to: { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
        "check-draw": {
          from: { strokeDashoffset: "120", opacity: "0" },
          to: { strokeDashoffset: "0", opacity: "1" },
        },
        "tick": {
          "0%": { transform: "translateY(-4px)", opacity: "0.4" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-18px,0) scale(1.06)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "glow-pulse": "glow-pulse 3.2s ease-in-out infinite",
        "qr-reveal": "qr-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "check-draw": "check-draw 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.15s both",
        "tick": "tick 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "drift": "drift 14s ease-in-out infinite",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
