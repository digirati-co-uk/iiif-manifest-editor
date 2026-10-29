import { rolldown } from "rolldown";
import { registerRuntime } from "./runtime-api.mjs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { isExactVersion, validateCatalog } from "../src/remote/releases.ts";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const require = createRequire(resolve(packageDir, "package.json"));
const postcss = require("postcss");
const postcssImport = require("postcss-import");
const pkg = JSON.parse(await readFile(resolve(packageDir, "package.json"), "utf8"));
const version = process.env.ME_BROWSER_VERSION || pkg.version;
const dependencies = {
  i18n: require("@manifest-editor/i18n/package.json").version,
  react: require("react/package.json").version,
  reconciler: createRequire(require.resolve("@atlas-viewer/atlas"))("react-reconciler/package.json").version,
};
if (require("react-dom/package.json").version !== dependencies.react)
  throw new Error("Browser runtime requires matching React and ReactDOM versions");
if (Number(dependencies.react.split(".")[0]) !== 19) throw new Error("Browser runtime requires React 19");
if (Object.values(dependencies).some((value) => !isExactVersion(value)))
  throw new Error("Browser runtime dependencies must have exact published versions");
if (!isExactVersion(version)) throw new Error("Invalid ME_BROWSER_VERSION");
if (!process.argv.includes("--local") && version !== pkg.version) {
  throw new Error("Published runtime version must match package.json; version overrides are local fixtures only");
}
const externals = [
  "@manifest-editor/i18n",
  "@manifest-editor/i18n/core",
  "react",
  "react-dom",
  "react-dom/client",
  "react-dom/server",
  "react-dom/server.browser",
  "react/jsx-runtime",
  // Atlas must use a reconciler built for the host's React and development mode.
  "react-reconciler",
];
const cssFiles = new Set([resolve(packageDir, "reset.css"), resolve(packageDir, "dist/index.css")]);
const bundle = await rolldown({
  input: resolve(packageDir, "browser/entry.ts"),
  platform: "browser",
  external: externals,
  transform: {
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      global: "globalThis",
      "import.meta.env": JSON.stringify({ MODE: "production" }),
    },
  },
  plugins: [
    {
      name: "collect-runtime-css",
      transform(code, id) {
        if (!id.endsWith(".css") && /import\(["'`]react-dom(?:\/client)?["'`]\)/.test(code)) {
          return `import * as __meReactDOM from "react-dom";\nimport * as __meReactDOMClient from "react-dom/client";\n${code.replace(/import\(["'`]react-dom["'`]\)/g, "Promise.resolve(__meReactDOM)").replace(/import\(["'`]react-dom\/client["'`]\)/g, "Promise.resolve(__meReactDOMClient)")}`;
        }
      },
      load(id) {
        if (id.endsWith(".css")) {
          cssFiles.add(id);
          return { code: "", moduleType: "js" };
        }
      },
    },
  ],
  onwarn(warning) {
    if (warning.code === "UNRESOLVED_IMPORT") throw new Error(warning.message);
    if (warning.code !== "MODULE_LEVEL_DIRECTIVE") console.warn(warning.message);
  },
});
const { output } = await bundle.generate({ format: "cjs", codeSplitting: false, minify: true });
await bundle.close();
const chunks = output.filter((item) => item.type === "chunk");
if (
  Object.keys(chunks[0].modules).some(
    (id) =>
      /(?:packages\/i18n|internal-packages\/languages)\//.test(id) ||
      /node_modules\/@manifest-editor\/(?:i18n|languages)\//.test(id)
  )
) {
  throw new Error("Public i18n runtime and private catalogs must not be bundled into the browser facade");
}
if (Object.keys(chunks[0].modules).some((id) => /node_modules\/(react|react-dom|react-reconciler)\//.test(id))) {
  throw new Error("React and its renderers must come from the host, not the runtime bundle");
}
if (
  chunks.length !== 1 ||
  /\bimport\s*\(/.test(chunks[0].code) ||
  chunks[0].imports.some((id) => !externals.includes(id))
) {
  throw new Error(
    "Browser runtime must contain one script with only host React/i18n imports: " +
      JSON.stringify(chunks.map(({ fileName, imports, dynamicImports }) => ({ fileName, imports, dynamicImports })))
  );
}

// Inline CSS assets so the stylesheet's hash also covers fonts and images.
const inlineAssets = {
  postcssPlugin: "inline-runtime-assets",
  async Declaration(declaration) {
    const urls = [...declaration.value.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)];
    for (const match of urls) {
      const url = match[1];
      if (url.startsWith("data:") || url.startsWith("#")) continue;
      if (/^(https?:|\/\/)/.test(url)) throw new Error(`External stylesheet asset: ${url}`);
      const filename = resolve(dirname(declaration.source.input.file), url.split(/[?#]/)[0]);
      const extension = filename.split(".").pop();
      const mime = {
        svg: "image/svg+xml",
        png: "image/png",
        gif: "image/gif",
        jpg: "image/jpeg",
        woff: "font/woff",
        woff2: "font/woff2",
        ttf: "font/ttf",
      }[extension];
      if (!mime) throw new Error(`Unknown stylesheet asset type: ${filename}`);
      const content = await readFile(filename);
      declaration.value = declaration.value.replace(
        match[0],
        `url("data:${mime};base64,${content.toString("base64")}")`
      );
    }
  },
};
let css = "";
const orderedCss = [...cssFiles];
for (const filename of [...orderedCss.slice(0, 2), ...orderedCss.slice(2).sort()]) {
  const result = await postcss([postcssImport(), inlineAssets]).process(await readFile(filename, "utf8"), {
    from: filename,
  });
  css += result.css + "\n";
}
const buildId = createHash("sha256")
  .update(version + JSON.stringify(dependencies) + registerRuntime.toString() + chunks[0].code + css)
  .digest("hex")
  .slice(0, 32);
const code = `(${registerRuntime.toString()})(globalThis, ${JSON.stringify(buildId)}, ${JSON.stringify(version)}, function(host) {\nconst exports = {}; const module = { exports };\nconst require = (id) => { if (!Object.hasOwn(host, id)) throw new Error("Missing host dependency: " + id); return host[id]; };\n${chunks[0].code}\nreturn module.exports;\n}, undefined, ${JSON.stringify(dependencies)});\n`;
const integrity = (value) => `sha384-${createHash("sha384").update(value).digest("base64")}`;
const descriptor = (base) => ({
  version,
  buildId,
  runtimeApiVersion: 2,
  reactMajor: 19,
  dependencies,
  script: { url: `${base}/runtime.js`, integrity: integrity(code) },
  stylesheet: { url: `${base}/runtime.css`, integrity: integrity(css) },
});
const dist = resolve(packageDir, "dist/browser");
await mkdir(dist, { recursive: true });
await writeFile(resolve(dist, "runtime.js"), code);
await writeFile(resolve(dist, "runtime.css"), css);
await writeFile(
  resolve(dist, "release.json"),
  JSON.stringify(descriptor(`https://cdn.jsdelivr.net/npm/manifest-editor@${version}/dist/browser`), null, 2) + "\n"
);

if (process.argv.includes("--local")) {
  const base = `/remote-editor/assets/${buildId}`;
  const publicDir = resolve(root, "apps/web/public");
  await mkdir(resolve(publicDir, base.slice(1)), { recursive: true });
  await writeFile(resolve(publicDir, base.slice(1), "runtime.js"), code);
  await writeFile(resolve(publicDir, base.slice(1), "runtime.css"), css);
  const catalogPath = resolve(publicDir, "remote-editor/catalog.json");
  let catalog = { releases: [], latest: null };
  try {
    catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  catalog.releases = [...catalog.releases.filter((item) => item.version !== version), descriptor(base)];
  if (!version.includes("-")) catalog.latest = version;
  validateCatalog(catalog);
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
}
console.log(
  `Browser runtime ${version}: ${(code.length / 1024 / 1024).toFixed(1)} MB JS, ${(css.length / 1024).toFixed(0)} KB CSS → ${relative(root, dist)}`
);
