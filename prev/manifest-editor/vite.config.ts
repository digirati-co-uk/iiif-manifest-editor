import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { ecsstatic } from "@acab/ecsstatic/vite";
import path from "path";

export default defineConfig({
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
  },
  // optimizeDeps: {
  //   exclude: ["react-iiif-vault", "@atlas-viewer/atlas"],
  // },
  envPrefix: ["VITE_", "TAURI_", "PULL_REQUEST"],
  plugins: [
    ecsstatic(),
    react({
      jsxRuntime: "automatic",
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
  resolve: {
    dedupe: ["@iiif/helpers"],

    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // optimizeDeps: {
  //   include: ["react/jsx-runtime", "@atlas-viewer/atlas"],
  // },
  build: {
    // Tauri supports es2021
    target: ["es2021", "chrome97", "safari13"],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG && "esbuild",
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
