/** Postpublication check: uses real jsDelivr/esm.sh requests without routing or module mocks. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { validateCatalog, isExactVersion } from "../packages/manifest-editor/src/remote/releases.ts";

const version =
  process.argv[2] ||
  JSON.parse(await readFile(new URL("../packages/manifest-editor/package.json", import.meta.url), "utf8")).version;
assert.ok(isExactVersion(version), "Supply an exact published version");
const base = `https://cdn.jsdelivr.net/npm/manifest-editor@${version}/dist/browser`;
async function fetchAsset(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
const release = JSON.parse((await fetchAsset(`${base}/release.json`)).toString());
validateCatalog({ releases: [release], latest: null });
assert.equal(release.version, version);
assert.equal(release.runtimeApiVersion, 2);
assert.ok(release.dependencies?.i18n && release.dependencies?.react, "Missing exact dependency pins");
for (const asset of [release.script, release.stylesheet]) {
  const bytes = await fetchAsset(asset.url);
  assert.equal(`sha384-${createHash("sha384").update(bytes).digest("base64")}`, asset.integrity, asset.url);
}
const { chromium } = createRequire(new URL("../packages/playwright/package.json", import.meta.url))("@playwright/test");
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("about:blank");
  await page.evaluate(async (release) => {
    await Promise.all([
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = release.script.url;
        script.integrity = release.script.integrity;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Published runtime/SRI failed"));
        document.head.appendChild(script);
      }),
      new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = release.stylesheet.url;
        link.integrity = release.stylesheet.integrity;
        link.crossOrigin = "anonymous";
        link.onload = resolve;
        link.onerror = () => reject(new Error("Published stylesheet/SRI failed"));
        document.head.appendChild(link);
      }),
    ]);
    const runtime = await window.ManifestEditor.automaticRuntime();
    const { i18n, i18nCore, React, ReactDOMClient } = runtime;
    const nl = await import(
      `https://esm.sh/@manifest-editor/i18n@${release.dependencies.i18n}/nl?deps=react@${release.dependencies.react}&target=es2022`
    );
    const instance = i18nCore.createEditorI18n({
      locales: [...i18nCore.defaultLocales, i18nCore.dutchLocale],
      resourceLoaders: [
        { locale: "nl", load: async () => ({ catalogs: nl.dutchCatalogs, profiles: { plain: nl.dutchPlain } }) },
      ],
    });
    function Probe() {
      return React.createElement("output", { id: "result" }, i18n.useTranslations("editor-api")("fields.label"));
    }
    const root = ReactDOMClient.createRoot(document.body);
    root.render(React.createElement(i18n.EditorI18nProvider, { instance }, React.createElement(Probe)));
    await instance.select({ locale: "nl", profile: "plain" });
  }, release);
  await page.waitForFunction(() => document.getElementById("result")?.textContent === "Titel");
  assert.deepEqual(errors, []);
  console.log(
    `Published CDN ${version}: real script/CSS integrity, automatic root/core identity and Dutch/plain rendering passed`
  );
} finally {
  await browser.close();
}
