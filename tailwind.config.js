/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "neon-blue": "var(--neon-blue)",
        "neon-purple": "var(--neon-purple)",
        "neon-pink": "var(--neon-pink)",
        "neon-green": "var(--neon-green)",
        "neon-red": "var(--neon-red)",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "grid-flow": "grid-flow 1s linear infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "grid-flow": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(20px)" },
        },
      },
    },
  },
  plugins: [],
};
