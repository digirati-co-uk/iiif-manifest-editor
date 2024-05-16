/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./stories/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      //
      black: "#000",
      white: "#fff",
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
    extend: {},
  },
  plugins: [],
};
