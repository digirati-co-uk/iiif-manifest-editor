import { mkdir, writeFile } from "node:fs/promises";
import { builtinLoaders } from "../src/catalogs.ts";
import { translatorNotes } from "../src/translator-notes.ts";
import { exportCatalogJson } from "../src/translation-files.ts";

const destination = new URL("../translations/export/en-GB/", import.meta.url);
await mkdir(destination, { recursive: true });
for (const [namespace, loader] of Object.entries(builtinLoaders)) {
  await writeFile(new URL(`${namespace}.json`, destination), exportCatalogJson(await loader()));
}
await writeFile(new URL("translator-notes.json", destination), JSON.stringify(translatorNotes, null, 2) + "\n");
console.log(
  "Exported source seed catalogs to this package's translations/export/en-GB directory. TypeScript remains authoritative; profile/preset overlays require separate translation review."
);
