/** CI consumer acceptance. Requires existing package/browser builds; never builds workspace packages. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, readdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { rolldown } from "rolldown";
import { esmExternalRequirePlugin } from "rolldown/plugins";

const root = fileURLToPath(new URL("../", import.meta.url));
const run = promisify(execFile);
const temporary = await mkdtemp(join(tmpdir(), "manifest-editor-artifacts-"));
let server;
let browser;
try {
  const packages = [];
  for (const group of ["packages", "presets", "plugins"]) {
    for (const entry of await readdir(join(root, group), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const directory = join(root, group, entry.name);
      const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
      if (!manifest.private) packages.push({ directory, manifest });
    }
  }
  const tarballs = join(temporary, "tarballs");
  await mkdir(tarballs);
  // pnpm applies publishConfig and workspace versions. Lifecycle scripts are explicitly disabled.
  for (const { directory } of packages) {
    await run("pnpm", ["--config.ignore-scripts=true", "pack", "--pack-destination", tarballs], {
      cwd: directory,
      maxBuffer: 8 * 1024 * 1024,
    });
  }
  const fixture = join(temporary, "consumer");
  await mkdir(fixture);
  const catalog = JSON.parse(await readFile(join(root, "packages/manifest-editor/dist/browser/release.json"), "utf8"));
  const { dependencies } = catalog;
  assert.ok(dependencies?.i18n && dependencies?.react && dependencies?.reconciler, "Missing browser dependency pins");
  await writeFile(
    join(fixture, "package.json"),
    JSON.stringify({
      name: "manifest-editor-external-consumer",
      private: true,
      type: "module",
      // Preserve the application's existing singleton policy in an installation without workspace links.
      overrides: { "prosemirror-model": "1.25.12", "react-reconciler": dependencies.reconciler },
    })
  );
  const archives = (await readdir(tarballs))
    .filter((name) => name.endsWith(".tgz"))
    .map((name) => join(tarballs, name));
  await run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--legacy-peer-deps",
      "--no-audit",
      "--no-fund",
      ...archives,
      `react@${dependencies.react}`,
      `react-dom@${dependencies.react}`,
      `react-reconciler@${dependencies.reconciler}`,
      "@types/react@19",
      "@types/react-dom@19",
    ],
    {
      cwd: fixture,
      maxBuffer: 8 * 1024 * 1024,
    }
  );
  const require = createRequire(join(fixture, "package.json"));
  assert.throws(() => require.resolve("@manifest-editor/languages/package.json"), /Cannot find/);
  const installed = [];
  async function inspect(directory, owner) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await inspect(path, owner);
      else if (/\.(?:js|cjs|mjs|ts|cts)$/.test(entry.name)) {
        const code = await readFile(path, "utf8");
        assert.doesNotMatch(
          code,
          /(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)["'](?:@manifest-editor\/languages|[^"']*internal-packages\/languages)/,
          path
        );
        assert.doesNotMatch(code, /(?:from\s*|import\s*\(|require\s*\()\s*["'][^"']+(?<!\.d)\.ts["']/, path);
        if (owner !== "@manifest-editor/i18n") {
          assert.ok(
            !code.includes("Expected an editor i18n runtime created by createEditorI18n"),
            `Bundled i18n runtime: ${path}`
          );
          assert.ok(!code.includes("data-editor-i18n"), `Bundled i18n provider: ${path}`);
        }
      }
    }
  }
  for (const { manifest } of packages) {
    const directory = join(fixture, "node_modules", manifest.name);
    assert.ok(!(await realpath(directory)).startsWith(root), `Workspace link: ${manifest.name}`);
    const packed = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
    assert.ok(!Object.keys(packed.dependencies || {}).includes("@manifest-editor/languages"));
    const checkExports = async (value) => {
      if (typeof value === "string" && value.startsWith("./") && !value.includes("*"))
        await readFile(join(directory, value));
      else if (value && typeof value === "object") for (const child of Object.values(value)) await checkExports(child);
    };
    await checkExports(packed.exports);
    await inspect(join(directory, "dist"), manifest.name);
    installed.push(manifest.name);
  }
  const coreFile = require.resolve("@manifest-editor/i18n/core");
  const core = require(coreFile);
  assert.equal(core.createEditorI18n().translate("common")("actions.save"), "Save");
  assert.ok(
    !Object.keys(require.cache).some((file) => /node_modules\/react(?:-dom|-i18next)?\//.test(file)),
    "Core loads React"
  );
  assert.ok(!Object.keys(require.cache).some((file) => /[/\\]nl\.[cm]?js$/.test(file)), "Core loads Dutch eagerly");
  for (const path of Object.keys(require.cache).filter((path) =>
    path.includes(`${sep}@manifest-editor${sep}i18n${sep}`)
  )) {
    assert.doesNotMatch(
      await readFile(path, "utf8"),
      /Canvas toevoegen|Uw eerste afbeeldingsmanifest/,
      "Dutch values in the default core"
    );
  }
  const coreText = await readFile(require.resolve("@manifest-editor/i18n/core"), "utf8");
  assert.ok(!/^\s*["']use client["']/.test(coreText), "Core is a client boundary");
  const reactText = await readFile(require.resolve("@manifest-editor/i18n"), "utf8");
  assert.match(reactText, /^\s*["']use client["']/);
  await run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `
    import assert from 'node:assert/strict';
    import {createEditorI18n, defaultLocales, dutchLocale} from '@manifest-editor/i18n/core';
    import {dutchCatalogs} from '@manifest-editor/i18n/nl';
    const runtime = createEditorI18n({locales:[...defaultLocales,dutchLocale], catalogs:dutchCatalogs, locale:'nl'});
    assert.equal(runtime.translate('common')('actions.save'), 'Opslaan');
  `,
    ],
    { cwd: fixture }
  );
  await writeFile(
    join(fixture, "consumer.mts"),
    `
    import { createEditorI18n, type LocaleResourceLoader } from '@manifest-editor/i18n/core';
    import { dutchCatalogs } from '@manifest-editor/i18n/nl';
    import type { BrowserRuntimeOptions } from 'manifest-editor/remote';
    const load: LocaleResourceLoader = {locale: 'nl', load: async () => ({catalogs: dutchCatalogs})};
    createEditorI18n({resourceLoaders: [load]});
    export type Host = BrowserRuntimeOptions;
  `
  );
  await writeFile(
    join(fixture, "consumer.cts"),
    `
    import core = require('@manifest-editor/i18n/core');
    import nl = require('@manifest-editor/i18n/nl');
    import react = require('@manifest-editor/i18n');
    core.createEditorI18n({catalogs: nl.dutchCatalogs});
    const Provider = react.EditorI18nProvider;
  `
  );
  await writeFile(
    join(fixture, "consumer.tsx"),
    `
    import { EditorI18nProvider, useTranslations } from '@manifest-editor/i18n';
    function Plugin() { return <output>{useTranslations('common')('actions.save')}</output>; }
    export const app = <EditorI18nProvider><Plugin /></EditorI18nProvider>;
  `
  );
  for (const [resolution, files] of [
    ["NodeNext", ["consumer.mts", "consumer.cts"]],
    ["Bundler", ["consumer.tsx"]],
  ]) {
    const config = join(fixture, `tsconfig.${resolution}.json`);
    await writeFile(
      config,
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          types: [],
          target: "ES2022",
          jsx: "react-jsx",
          module: resolution === "Bundler" ? "ESNext" : "NodeNext",
          moduleResolution: resolution,
        },
        files,
      })
    );
    await run(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", config], { cwd: fixture });
  }
  const publicDirectory = join(temporary, "public");
  await mkdir(join(publicDirectory, "modules"), { recursive: true });
  const assets = new Map();
  for (const [name, descriptor] of [
    ["runtime.js", catalog.script],
    ["runtime.css", catalog.stylesheet],
  ]) {
    const bytes = await readFile(join(root, "packages/manifest-editor/dist/browser", name));
    assert.equal(`sha384-${createHash("sha384").update(bytes).digest("base64")}`, descriptor.integrity, name);
    assets.set(`/remote-editor/assets/${catalog.buildId}/${name}`, bytes);
  }
  server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url, "http://fixture").pathname;
      const asset = assets.get(path);
      const file = resolve(publicDirectory, `.${path === "/" ? "/index.html" : path}`);
      if (!asset && !file.startsWith(publicDirectory + sep)) throw new Error("Invalid path");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader(
        "Content-Type",
        (path.endsWith(".css") ? "text/css" : path === "/" ? "text/html" : "text/javascript") + "; charset=utf-8"
      );
      response.end(asset ?? (await readFile(file)));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  // Explicit named exports make CommonJS entrypoints behave like their CDN ESM facades.
  const cjsEntry = (id, keys = Object.keys(require(id))) =>
    `import value from ${JSON.stringify(id)}; export default value; export const {${keys
      .filter((key) => key !== "default" && /^[A-Za-z_$][\w$]*$/.test(key))
      .join(",")}} = value;`;
  const entries = {
    i18n: "export * from '@manifest-editor/i18n';",
    core: "export * from '@manifest-editor/i18n/core';",
    nl: "export * from '@manifest-editor/i18n/nl';",
    react: cjsEntry("react"),
    dom: cjsEntry("react-dom"),
    client: cjsEntry("react-dom/client"),
    // Requiring the browser renderer in Node opens a persistent MessageChannel.
    server: cjsEntry("react-dom/server.browser", [
      "renderToString",
      "renderToStaticMarkup",
      "renderToReadableStream",
      "resume",
      "version",
    ]),
    jsx: cjsEntry("react/jsx-runtime"),
    reconciler: "export {default} from 'react-reconciler';",
    remote: "export * from 'manifest-editor/remote';",
  };
  for (const [name, content] of Object.entries(entries)) await writeFile(join(fixture, `${name}.js`), content);
  const bundle = await rolldown({
    input: Object.fromEntries(Object.keys(entries).map((name) => [name, join(fixture, `${name}.js`)])),
    platform: "browser",
    transform: { define: { "process.env.NODE_ENV": '"production"' } },
  });
  const { output } = await bundle.write({
    dir: join(publicDirectory, "modules"),
    format: "esm",
    entryFileNames: "[name].js",
  });
  await bundle.close();
  const entry = output.find((chunk) => chunk.type === "chunk" && chunk.name === "core");
  const byName = new Map(output.filter((chunk) => chunk.type === "chunk").map((chunk) => [chunk.fileName, chunk]));
  const initial = new Map();
  function visit(chunk) {
    if (!chunk || initial.has(chunk.fileName)) return;
    initial.set(chunk.fileName, chunk);
    for (const name of chunk.imports) visit(byName.get(name.replace(/^\.\//, "")));
  }
  visit(entry);
  assert.ok(
    [...initial.values()].every((chunk) => !Object.keys(chunk.modules).some((id) => /[/\\]nl\.[cm]?js$/.test(id))),
    "Dutch is in the default graph"
  );
  const pluginDirectory = join(fixture, "node_modules/@fixture/i18n-plugin");
  await mkdir(pluginDirectory, { recursive: true });
  await writeFile(
    join(pluginDirectory, "package.json"),
    JSON.stringify({ name: "@fixture/i18n-plugin", type: "module", main: "./index.js" })
  );
  await writeFile(
    join(pluginDirectory, "index.js"),
    `
    import React from 'react';
    import {useEditorI18n, useTranslations} from '@manifest-editor/i18n';
    import plugin from '@manifest-editor/canvas-label-generator';
    export const installedPluginId = plugin.id;
    export function Probe() {
      const {locale, profile} = useEditorI18n();
      return React.createElement('output', {id:'plugin-probe'}, locale + '/' + profile + '/' + useTranslations('editor-api')('fields.label'));
    }
  `
  );
  const shared = {
    react: "react",
    "@manifest-editor/i18n": "i18n",
    "@manifest-editor/i18n/core": "core",
    "react/jsx-runtime": "jsx",
    "react-dom": "dom",
    "react-dom/client": "client",
    "react-dom/server": "server",
    "react-dom/server.browser": "server",
    "react-reconciler": "reconciler",
  };
  const pluginBundle = await rolldown({
    input: join(pluginDirectory, "index.js"),
    platform: "browser",
    transform: { define: { "process.env.NODE_ENV": '"production"' } },
    // The verified runtime stylesheet supplies editor/component CSS for this integration fixture.
    plugins: [
      esmExternalRequirePlugin({ external: Object.keys(shared) }),
      {
        name: "runtime-styles",
        load(id) {
          if (id.endsWith(".css")) return { code: "", moduleType: "js" };
        },
      },
    ],
  });
  await pluginBundle.write({
    dir: publicDirectory,
    entryFileNames: "plugin.js",
    chunkFileNames: "plugin-[hash].js",
    format: "esm",
    paths: (id) => `${origin}/modules/${shared[id]}.js`,
  });
  await pluginBundle.close();
  const release = {
    ...catalog,
    script: { ...catalog.script, url: `/remote-editor/assets/${catalog.buildId}/runtime.js` },
    stylesheet: { ...catalog.stylesheet, url: `/remote-editor/assets/${catalog.buildId}/runtime.css` },
  };
  const smoke = await readFile(new URL("./fixtures/i18n-browser-smoke.js", import.meta.url), "utf8");
  await writeFile(join(publicDirectory, "smoke.js"), smoke);
  await writeFile(
    join(publicDirectory, "index.html"),
    `<!doctype html><html><head>
    <link rel="stylesheet" href="${release.stylesheet.url}" integrity="${release.stylesheet.integrity}" crossorigin="anonymous">
    <script src="${release.script.url}" integrity="${release.script.integrity}" crossorigin="anonymous"></script>
    </head><body><div id="probe"></div><div id="editor"></div>
    <script>window.release = ${JSON.stringify(release)}</script><script type="module" src="/smoke.js"></script></body></html>`
  );
  const playwright = createRequire(join(root, "packages/playwright/package.json"))("@playwright/test");
  browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  const urls = [
    [`@manifest-editor/i18n@${dependencies.i18n}?deps=react@${dependencies.react}`, "i18n"],
    [`@manifest-editor/i18n@${dependencies.i18n}/core?deps=react@${dependencies.react}`, "core"],
    [`react@${dependencies.react}`, "react"],
    [`react-dom@${dependencies.react}?deps=react@${dependencies.react}`, "dom"],
    [`react-dom@${dependencies.react}/client?deps=react@${dependencies.react}`, "client"],
    [`react-dom@${dependencies.react}/server.browser?deps=react@${dependencies.react}`, "server"],
    [`react@${dependencies.react}/jsx-runtime`, "jsx"],
    [`react-reconciler@${dependencies.reconciler}?deps=react@${dependencies.react}`, "reconciler"],
  ];
  const cdn = new Map(
    urls.map(([path, name]) => [`https://esm.sh/${path}${path.includes("?") ? "&" : "?"}target=es2022`, name])
  );
  const requested = new Set();
  await page.route("https://esm.sh/**", async (route) => {
    const name = cdn.get(route.request().url());
    assert.ok(name, `Unexpected CDN import: ${route.request().url()}`);
    requested.add(name);
    // Unreleased i18n is served from the installed tarballs. These are real modules, never mocks.
    // Reexport one canonical module, as esm.sh's facade does. A redirect creates a second
    // module-map entry and can duplicate provider functions at the two entry URLs.
    const canonical = JSON.stringify(`${origin}/modules/${name}.js`);
    await route.fulfill({
      contentType: "text/javascript; charset=utf-8",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: `export * from ${canonical};${
        ["react", "dom", "client", "server", "jsx", "reconciler"].includes(name)
          ? `export {default} from ${canonical};`
          : ""
      }`,
    });
  });
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.smokeResult || window.smokeError, undefined, { timeout: 60_000 });
  const result = await page.evaluate(() => ({ result: window.smokeResult, error: window.smokeError }));
  assert.equal(result.error, undefined);
  assert.deepEqual(failures, []);
  assert.equal(requested.size, 7);
  // Corrupted integrity must fail in Chromium, not merely in the descriptor validator.
  const rejectedIntegrity = await page.evaluate(async () => {
    const { loadManifestEditor } = await import("/modules/remote.js");
    try {
      await loadManifestEditor(
        { ...window.release, script: { ...window.release.script, integrity: "sha384-" + "A".repeat(64) } },
        window.smokeHost
      );
      return false;
    } catch (error) {
      if (!error.message.includes("integrity")) throw error;
      return true;
    }
  });
  assert.equal(rejectedIntegrity, true, "Chromium accepted invalid integrity");
  const bytes = Buffer.from([...initial.values()].map((chunk) => chunk.code).join("\n"));
  const report = {
    installed,
    browser: result.result,
    defaultCore: {
      bytes: bytes.length,
      gzipBytes: gzipSync(bytes).length,
      brotliBytes: brotliCompressSync(bytes).length,
    },
    note: "Prepublication browser network/SRI uses packed artifacts at a fixture origin; live CDN availability is a separate postpublication check.",
  };
  const reportPath = join(root, "test-results/i18n-artifacts.json");
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  server?.closeAllConnections();
  await browser?.close();
  await new Promise((done) => (server ? server.close(done) : done()));
  await rm(temporary, { recursive: true, force: true });
}
