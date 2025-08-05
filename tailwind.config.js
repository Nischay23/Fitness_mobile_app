/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./modules/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4ADE80",
        secondary: "#2DD4BF",
        accent: "#F59E0B",
        background: "#000000",
        surface: "#1A1A1A",
        surfaceLight: "#2A2A2A",
        white: "#FFFFFF",
        grey: "#9CA3AF",
        // Fitness specific colors
        calories: "#EF4444",
        protein: "#3B82F6",
        carbs: "#F59E0B",
        fat: "#8B5CF6",
        water: "#06B6D4",
        steps: "#10B981",
        workout: "#EC4899",
        sleep: "#6366F1",
      },
      fontFamily: {
        sans: ["Inter-Regular", "sans-serif"],
        semibold: ["Inter-SemiBold", "sans-serif"],
        bold: ["Inter-Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
