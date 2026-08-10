import react from "@storylite/renderer-react";
import { defineConfig } from "@storylite/storylite";

export default defineConfig({
  stories: ["./stories/**/*.stories.tsx"],
  css: ["./src/index.css", "./stories/stories.css"],
  renderers: [react()],
  ui: {
    brand: {
      titleHtml: "<strong>ME Components</strong>",
    },
  },
  vitePlugins: [
    {
      name: "manifest-editor-browser-globals",
      config: () => ({
        define: {
          "global.setImmediate": "window.setImmediate",
        },
      }),
    },
  ],
});
