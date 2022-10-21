import { defineConfig } from "vitest/config";
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(readFileSync("./package.json").toString());

const BUNDLED_DEPENDENCIES: string[] = ["@atlas-viewer/atlas"];
const DEDUPE_DEPENDENCIES = ["react", "react-dom", "styled-components"];

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      dedupe: DEDUPE_DEPENDENCIES,
      alias: {
        "@": resolve(__dirname, "../src"),
      },
    },
    optimizeDeps: {
      exclude: Object.keys(pkg.dependencies),
    },
    define: {
      PULL_REQUEST: false,
    },
    build: {
      outDir: `dist/npm`,
      lib: {
        formats: ["es"],
        fileName: (format: string) => `manifest-editor.${format}.js`,
        entry: "src/npm.tsx",
        name: "ManifestEditor",
      },
      manifest: true,
      target: ["es2021", "chrome97", "safari13"],
      minify: false,
      sourcemap: true,
      rollupOptions: {
        external: [
          "scheduler",
          "react-use",
          ...Object.keys(pkg.dependencies).filter((dep) => BUNDLED_DEPENDENCIES.indexOf(dep) === -1),
        ],
      },
    },
    plugins: [react({})],
  };
});
