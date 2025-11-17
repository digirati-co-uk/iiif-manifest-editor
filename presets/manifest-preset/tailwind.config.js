const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      //
      black: "#000",
      white: "#fff",
      gray: colors.gray,
      // Blue theme
      // "me-primary-50": "#E3F2FD",
      // "me-primary-100": "#BBDEFB",
      // "me-primary-200": "#90CAF9",
      // "me-primary-300": "#64B5F6",
      // "me-primary-400": "#42A5F5",
      // "me-primary-500": "#2196F3",
      // "me-primary-600": "#1E88E5",
      // "me-primary-700": "#1976D2",
      // "me-primary-800": "#1565C0",
      // "me-primary-900": "#0D47A1",

      // Pink theme
      "me-primary-50": "#FAEAF3",
      "me-primary-100": "#F1D6E5",
      "me-primary-500": "#B84C74",
      "me-primary-600": "#892C4E",
      "me-secondary-500": "#F1D6E5",
      "me-secondary-100": "#ECF5E8",
      "me-gray-100": "#F5F5F5",
      "me-gray-300": "#D9D9D9",
      "me-gray-500": "#A1A1A1",
      "me-gray-700": "#666666",
      "me-gray-900": "#333333",
      transparent: "transparent",

      me: {
        50: "#fbf4f7",
        100: "#f8ebf1",
        200: "#f2d8e5",
        300: "#e9b8cf",
        400: "#da8caf",
        500: "#cc6892",
        600: "#b84c74",
        700: "#9d395c",
        800: "#83314c",
        900: "#6e2d42",
        950: "#421524",
      },
    },
    extend: {
      // that is animation class
      animation: {
        fadeIn: "fadeIn 300ms ease-in-out",
        fadeInDelayed: "fadeInDelayed 2000ms ease-in-out",
      },

      // that is actual animation
      keyframes: () => ({
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeInDelayed: {
          "0%": { opacity: 0 },
          "85%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      }),
    },
  },
  plugins: [],
};
