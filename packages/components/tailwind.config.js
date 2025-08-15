const colors = require("tailwindcss/colors");
const typography = require("@tailwindcss/typography");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./stories/**/*.{js,jsx,ts,tsx}",
    // @todo fix bundle issues.
    "../editors/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      //
      black: "#000",
      white: "#fff",
      gray: colors.gray,
      red: colors.red,
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
  plugins: [typography],
};
