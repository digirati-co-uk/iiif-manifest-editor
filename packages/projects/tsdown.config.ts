import { esmExternalRequirePlugin } from "rolldown/plugins";
import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: true,
  clean: !options.watch,
  minify: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  deps: { alwaysBundle: ["react-accessible-dropdown-menu-hook"] },
  sourcemap: true,
  plugins: [esmExternalRequirePlugin({ external: ["react"] })],
}));
