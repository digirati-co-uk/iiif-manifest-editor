import typography from "@tailwindcss/typography";
import colors from "tailwindcss/colors";

// Module import isn't working...
const exhibitionTypography = {
  DEFAULT: {
    css: {
      a: {
        "text-decoration": "none",
        "font-weight": "500",
      },
      "h1, h2, h3, h4, h5": {
        "font-weight": "500",
      },
      strong: {
        "font-weight": "500",
      },
      blockquote: {
        "font-weight": "normal",
      },
    },
  },
};

export const exhibitionViewerTailwindColors = {
  // Background colors
  BackgroundPrimary: "var(--delft-bg-primary)",
  BackgroundSecondary: "var(--delft-bg-secondary)",
  BackgroundOverlay: "var(--delft-bg-overlay)",

  // Text colors
  TextPrimary: "var(--delft-text-primary)",
  TextSecondary: "var(--delft-text-secondary)",
  ImageCaption: "var(--delft-image-caption)",
  AnnotationSelected: "var(--delft-annotation-selected)",

  // UI elements
  ControlBar: "var(--delft-control-bar)",
  ControlBarBorder: "var(--delft-control-bar-border)",
  ControlHover: "var(--delft-control-hover)",

  ProgressBar: "var(--delft-progress-bar)",

  CloseBackground: "var(--delft-close-background)",
  CloseBackgroundHover: "var(--delft-close-background-hover)",
  CloseText: "var(--delft-close-text)",

  // Title elements
  TitleCard: "var(--delft-title-card)",
  TitleCardText: "var(--delft-title-card-text)",

  // Info blocks
  InfoBlock: "var(--delft-info-block)",
  InfoBlockText: "var(--delft-info-block-text)",

  // Viewer elements
  ViewerBackground: "var(--delft-viewer-background)",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./content/**/*.{md,mdx}",

    "../../presets/collection-preset/src/**/*.{ts,tsx,css}",
    "../../presets/exhibition-preset/src/**/*.{ts,tsx,css}",
    "../../presets/manifest-preset/src/**/*.{ts,tsx,css}",

    "../../packages/components/src/**/*.{ts,tsx,css}",
    "../../packages/editors/src/**/*.{ts,tsx,css}",
    "../../packages/creators/src/**/*.{ts,tsx,css}",
    "../../packages/shell/src/**/*.{ts,tsx,css}",

    "./node_modules/exhibition-viewer/**/*.{js,css,cjs,mjs}",
    "./node_modules/iiif-browser/**/*.{js,css,cjs,mjs}",
  ],
  theme: {
    colors: {
      //
      black: "#000",
      white: "#fff",
      gray: colors.gray,
      slate: colors.slate,
      blue: colors.blue,
      orange: colors.orange,
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

      // Testing new pallette
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
      ...exhibitionViewerTailwindColors,
    },
    typography: exhibitionTypography,
    extend: {},
  },
  plugins: [typography],
};
