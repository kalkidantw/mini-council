import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Original colors
        "bg-deep": "#1B1022",
        "bg-glare": "#3E1A45",
        "accent-warm": "#FFA166",
        "text-base": "#F4F4F5",
        "text-sub": "#C2C2C6",
        // Animated AI Personas colors
        "animated-deep": "#170F1E",
        "animated-card-glass": "rgba(255, 255, 255, 0.07)",
        "animated-text-main": "#FFFFFF",
        "animated-text-dim": "#A6A6A6",
        "animated-accent": "#FF8A5C",
        "animated-heart": "#FF5A79",
        "animated-logic": "#9B6EFF",
        "animated-shadow": "#A64AC9",
        "animated-dilemma-pill": "#2D2135",
        "animated-avatar-bg": "#2C1A28",
      },
      backgroundImage: {
        "gradient-hero": "radial-gradient(ellipse at center, #3E1A45 0%, #1B1022 70%)",
        "gradient-form": "linear-gradient(135deg, #3E1A45 0%, #1B1022 100%)",
        "gradient-steps": "linear-gradient(180deg, #0F0C2B 0%, #281538 100%)",
        "gradient-cta": "linear-gradient(90deg, #FFAA5C, #FF6C6C)",
        "gradient-debate": "linear-gradient(180deg, #2B1236 0%, #050814 100%)",
        "gradient-synthesis": "linear-gradient(to right, #FFA54F, #FF6172)",
        "gradient-exact": "linear-gradient(180deg, #2A1B3D 0%, #1A0F2E 50%, #0F0A1C 100%)",
        "gradient-orange": "linear-gradient(90deg, #FF8A50, #FF6B47)",
        "gradient-animated-wisdom": "linear-gradient(90deg, #FFB347, #FF416C)",
      },
      animation: {
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        flicker: "flicker 2.5s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out",
        "float-in": "floatIn 0.7s ease-in-out",
        "stagger-1": "fadeIn 0.5s ease-out 0.1s both",
        "stagger-2": "fadeIn 0.5s ease-out 0.2s both",
        "stagger-3": "fadeIn 0.5s ease-out 0.3s both",
        "pulse-glow": "pulseGlow 1.8s ease-in-out infinite",
        "float-slow": "floatSlow 7s ease-in-out infinite",
        "flicker-fast": "flickerFast 0.6s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "title-glow": "titleGlow 2s ease-in-out infinite",
        // Animated AI Personas animations
        "fade-in-animated": "fadeInAnimated 0.5s ease-out",
        "pulse-active-animated": "pulseActiveAnimated 1.2s ease-in-out infinite",
        "float-up-animated": "floatUpAnimated 0.7s ease-out",
        "scale-tap-animated": "scaleTapAnimated 0.15s ease-out",
        "pulse-animated": "pulseAnimated 1.5s ease-in-out infinite",
        "blink-animated": "blinkAnimated 0.15s ease-in-out",
        "glow-speak-animated": "glowSpeakAnimated 2s ease-in-out infinite",
        "scale-102": "scale102 0.2s ease-out",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": {
            textShadow:
              "0 0 5px rgba(255, 161, 102, 0.5), 0 0 10px rgba(255, 161, 102, 0.3), 0 0 15px rgba(255, 161, 102, 0.2)",
            transform: "scale(1)",
          },
          "50%": {
            textShadow:
              "0 0 10px rgba(255, 161, 102, 0.8), 0 0 20px rgba(255, 161, 102, 0.5), 0 0 30px rgba(255, 161, 102, 0.3)",
            transform: "scale(1.02)",
          },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
          "75%": { opacity: "0.9" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": {
            transform: "scale(1)",
            filter: "brightness(1)",
          },
          "50%": {
            transform: "scale(1.02)",
            filter: "brightness(1.1)",
          },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        flickerFast: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        titleGlow: {
          "0%, 100%": {
            textShadow: "0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)",
          },
          "50%": {
            textShadow: "0 0 30px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.3)",
          },
        },
        // Animated AI Personas keyframes
        fadeInAnimated: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseActiveAnimated: {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.05)", filter: "brightness(1.1)" },
        },
        floatUpAnimated: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleTapAnimated: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" },
        },
        pulseAnimated: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        blinkAnimated: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(0.1)" },
        },
        glowSpeakAnimated: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.15)" },
        },
        scale102: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 161, 102, 0.3), 0 0 40px rgba(255, 161, 102, 0.1)",
        "glow-strong": "0 0 30px rgba(255, 161, 102, 0.4), 0 0 60px rgba(255, 161, 102, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "avatar-selected": "0 0 30px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        wisdom: "0 0 30px rgba(255, 170, 76, 0.4), 0 0 60px rgba(255, 92, 128, 0.2)",
        "animated-modal": "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
      scale: {
        "97": "0.97",
        "102": "1.02",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
