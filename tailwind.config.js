/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        dashboard: {
          bg: "#0A1628",
          surface: "#0F2747",
          card: "#162A4A",
          border: "#1E3A5F",
          text: "#E2E8F0",
          muted: "#64748B",
        },
        risk: {
          high: "#DC2626",
          highBg: "rgba(220, 38, 38, 0.15)",
          medium: "#F59E0B",
          mediumBg: "rgba(245, 158, 11, 0.15)",
          low: "#10B981",
          lowBg: "rgba(16, 185, 129, 0.15)",
        },
        accent: {
          blue: "#3B82F6",
          cyan: "#06B6D4",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        "slide-in-up": "slideInUp 0.4s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite alternate",
        "count-up": "countUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(220, 38, 38, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(220, 38, 38, 0.8)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
        "risk-high": "0 0 15px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "risk-medium": "0 0 15px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "risk-low": "0 0 15px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
};
