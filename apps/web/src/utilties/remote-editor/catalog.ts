import { validateCatalog, type ReleaseCatalog } from "../../../../../packages/manifest-editor/src/remote/releases";

export async function getReleaseCatalog(request: Request): Promise<ReleaseCatalog> {
  // The URL is deployment configuration, never a client-supplied catalog URL.
  const url = process.env.ME_RELEASE_CATALOG_URL || new URL("/remote-editor/catalog.json", request.url).href;
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!response.ok)
    throw new Error("No browser release catalog. Run pnpm browser:local or configure ME_RELEASE_CATALOG_URL.");
  const catalog: unknown = await response.json();
  validateCatalog(catalog);
  return catalog;
}
