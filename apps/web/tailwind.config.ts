import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        "slide-left": {
          "0%": { transform: "translateX(0)" },
          "45%": { transform: "translateX(-10px)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-right": {
          "0%": { transform: "translateX(0)" },
          "45%": { transform: "translateX(10px)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(0)" },
          "45%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { transform: "translateY(0)" },
          "45%": { transform: "translateY(10px)" },
          "100%": { transform: "translateY(0)" },
        },
        "tile-correct": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-5px)" },
          "40%": { transform: "translateX(5px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "65%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(60px) rotate(360deg)", opacity: "0" },
        },
      },
      animation: {
        "slide-left": "slide-left 200ms ease-out",
        "slide-right": "slide-right 200ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        "slide-down": "slide-down 200ms ease-out",
        "tile-correct": "tile-correct 350ms ease-out",
        shake: "shake 350ms ease-out",
        "bounce-in": "bounce-in 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-in": "fade-in 300ms ease-out",
        "confetti-fall": "confetti-fall 800ms ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
