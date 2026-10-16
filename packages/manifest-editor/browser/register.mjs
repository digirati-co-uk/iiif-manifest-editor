import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { validateCatalog } from "../src/remote/releases.ts";

// Register the hash generated at publish time; never trust hashes fetched from the asset CDN.
const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const filename = process.argv[2];
if (!filename) throw new Error("Usage: node browser/register.mjs <trusted-release.json> [--latest]");
const release = JSON.parse(await readFile(resolve(filename), "utf8"));
validateCatalog({ releases: [release], latest: null });
if (!release.script.url.startsWith("https://cdn.jsdelivr.net/"))
  throw new Error("Expected a published CDN release descriptor");
const catalogPath = resolve(packageDir, "../../apps/web/public/remote-editor/catalog.json");
let catalog = { releases: [], latest: null };
try {
  catalog = JSON.parse(await readFile(catalogPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
catalog.releases = [...catalog.releases.filter((item) => item.version !== release.version), release];
if (process.argv.includes("--latest")) catalog.latest = release.version;
validateCatalog(catalog);
for (const asset of [release.script, release.stylesheet]) {
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`CDN asset unavailable (${response.status}): ${asset.url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const integrity = `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
  if (integrity !== asset.integrity) throw new Error(`CDN asset integrity mismatch: ${asset.url}`);
}
await mkdir(dirname(catalogPath), { recursive: true });
await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(`Registered verified CDN release ${release.version}`);
