import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Frosted deep-navy palette — premium analytics console.
        bg: {
          base: "#070B12",
          card: "#0C111B",
          elev: "#121826",
          hover: "#18202F",
        },
        border: {
          subtle: "#1B2433",
          DEFAULT: "#27324559",
          strong: "#3A486099",
        },
        text: {
          primary: "#E8EDF4",
          secondary: "#93A1B5",
          tertiary: "#5E6B7E",
          muted: "#3D4655",
        },
        // Restrained accent system (teal / blue / amber)
        signal: {
          DEFAULT: "#46C7D6", // calm teal-cyan — primary accent
          dim: "#1F6B73",
          glow: "rgba(70, 199, 214, 0.16)",
        },
        blue: {
          DEFAULT: "#6AA8FF",
          dim: "#3D6CB0",
        },
        alert: {
          DEFAULT: "#F2607A", // soft coral
          dim: "#B23A52",
          glow: "rgba(242, 96, 122, 0.16)",
        },
        warn: {
          DEFAULT: "#F2B45C", // muted amber
          dim: "#C98A2F",
        },
        ok: {
          DEFAULT: "#4ED7A8", // mint
          dim: "#2FA67D",
        },
        flight: { DEFAULT: "#46C7D6" },
        quake: { DEFAULT: "#F0925A" },
        space: { DEFAULT: "#8FA0E8" },
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "fade-in": "fadeIn 200ms ease-out",
        scan: "scan 6s linear infinite",
        flicker: "flicker 4s infinite",
        sweep: "sweep 3s linear infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "97%": { opacity: "1" },
          "98%": { opacity: "0.6" },
          "99%": { opacity: "1" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
