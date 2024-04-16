import { defineConfig, type Options } from "tsup";
import cssPlugin from "esbuild-plugin-react18-css";

export default defineConfig((ctx) => {
  return {
    dts: true,
    target: ["es2020"],
    format: ["esm", "cjs", "iife"],
    esbuildPlugins: [cssPlugin()],
    globalName: "IIIFBrowser",
    platform: "browser",
    minify: true,
    external: [
      // -
      "@iiif/parser",
      "@iiif/helpers",
    ],
  };
});
