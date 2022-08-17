import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-styled-components",
            {
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
  ],
  test: {
    environment: "happy-dom", // or 'jsdom', 'node'
    globals: true,
  },
  build: {
    // Tauri supports es2021
    target: ["es2021", "chrome97", "safari13"],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG && "esbuild",
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
