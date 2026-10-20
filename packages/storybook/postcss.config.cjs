const path = require("node:path");
const { createRequire } = require("node:module");

module.exports = {
  plugins: [
    require("postcss-import")({
      // The editor stylesheet references a published CSS bundle; use its source here.
      resolve(id, basedir) {
        if (id.includes("@manifest-editor/components/dist/lib.css")) {
          return path.resolve(__dirname, "../components/src/lib.css");
        }
        return createRequire(path.join(basedir, "package.json")).resolve(id);
      },
    }),
    require("tailwindcss")({ config: path.join(__dirname, "tailwind.config.ts") }),
    require("postcss-nested"),
    require("autoprefixer"),
  ],
};
