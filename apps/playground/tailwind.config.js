/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.tsx",

    "../../packages/shell/src/**/*.{js,jsx,ts,tsx}",
    "../../presets/manifest-preset/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
