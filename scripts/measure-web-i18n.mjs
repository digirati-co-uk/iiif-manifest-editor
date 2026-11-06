/** CI-only bundle measurement; generates in memory and does not start a server. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { rolldown } from "rolldown";

const root = fileURLToPath(new URL("../", import.meta.url));
const locales = ["nl", "fr", "de", "it", "es", "pt", "ja", "zh", "tr", "fi", "hi", "pl", "uk", "cs", "da", "ms", "ta"];
const provider = `${root}apps/web/src/i18n/WebI18nProvider.tsx`;
async function measure(eager) {
  const id = `${root}i18n-payload-entry.js`;
  const code =
    `export * from ${JSON.stringify(provider)};\n` +
    (eager
      ? locales
          .map(
            (locale) =>
              `import * as ${locale} from ${JSON.stringify(`${root}apps/web/src/i18n/locales/${locale}.ts`)}; export {${locale}};`
          )
          .join("\n")
      : "");
  const bundle = await rolldown({
    input: id,
    platform: "browser",
    transform: { jsx: { runtime: "automatic" }, define: { "process.env.NODE_ENV": '"production"' } },
    plugins: [
      {
        name: "payload-entry",
        resolveId(path) {
          if (path === id) return id;
        },
        load(path) {
          if (path === id) return code;
        },
      },
    ],
  });
  const { output } = await bundle.generate({ format: "esm", dir: "i18n-payload", minify: true });
  await bundle.close();
  const chunks = new Map(output.filter((item) => item.type === "chunk").map((chunk) => [chunk.fileName, chunk]));
  const initial = new Map();
  function visit(chunk) {
    if (initial.has(chunk.fileName)) return;
    initial.set(chunk.fileName, chunk);
    for (const name of chunk.imports) visit(chunks.get(name.replace(/^\.\//, "")));
  }
  visit([...chunks.values()].find((chunk) => chunk.isEntry));
  if (!eager) {
    const forbidden = new RegExp(`/(?:locales|plain)/(?:${locales.join("|")})(?:/|\\.)`);
    assert.ok(
      [...initial.values()].every((chunk) => Object.keys(chunk.modules).every((path) => !forbidden.test(path))),
      "Optional language values leaked into the initial web bundle"
    );
  }
  const bytes = Buffer.from([...initial.values()].map((chunk) => chunk.code).join("\n"));
  return {
    bytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
    brotliBytes: brotliCompressSync(bytes).length,
    initialChunks: initial.size,
    totalChunks: chunks.size,
  };
}
const lazy = await measure(false);
const eager = await measure(true);
assert.ok(lazy.brotliBytes < eager.brotliBytes, "Lazy loading did not reduce initial payload");
const report = {
  lazy,
  eager,
  note: "Identical production provider entry; eager comparison additionally imports all optional locale values. English fallback remains synchronous.",
};
await mkdir(new URL("../test-results/", import.meta.url), { recursive: true });
await writeFile(new URL("../test-results/i18n-payload.json", import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
