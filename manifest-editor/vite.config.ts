import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        [
          'babel-plugin-styled-components',
          {
            displayName: true,
            fileName: false
          }
        ]
      ]
    }
  })],
  test: {
    environment: "happy-dom", // or 'jsdom', 'node'
    globals: true,
  },
});
