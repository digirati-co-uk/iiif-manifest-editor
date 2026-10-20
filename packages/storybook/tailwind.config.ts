import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
export default {
  important: ".manifest-editor",
  content: [
    root + "{packages,presets,plugins}/*/src/**/*.{ts,tsx}",
    root + "packages/ui/{atoms,icons,components,ui,helpers,form-elements,madoc,editors}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        BackgroundPrimary: "var(--delft-bg-primary)",
        BackgroundSecondary: "var(--delft-bg-secondary)",
        BackgroundOverlay: "var(--delft-bg-overlay)",
        TextPrimary: "var(--delft-text-primary)",
        TextSecondary: "var(--delft-text-secondary)",
        ImageCaption: "var(--delft-image-caption)",
        AnnotationSelected: "var(--delft-annotation-selected)",
        ControlBar: "var(--delft-control-bar)",
        ControlBarBorder: "var(--delft-control-bar-border)",
        ControlHover: "var(--delft-control-hover)",
        ProgressBar: "var(--delft-progress-bar)",
        CloseBackground: "var(--delft-close-background)",
        CloseBackgroundHover: "var(--delft-close-background-hover)",
        CloseText: "var(--delft-close-text)",
        TitleCard: "var(--delft-title-card)",
        TitleCardText: "var(--delft-title-card-text)",
        InfoBlock: "var(--delft-info-block)",
        InfoBlockText: "var(--delft-info-block-text)",
        ViewerBackground: "var(--delft-viewer-background)",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
