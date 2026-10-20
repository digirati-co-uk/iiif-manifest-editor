import { Vault } from "@iiif/helpers";
import type { Manifest, Collection } from "@iiif/presentation-3";

export type LoadedResource = {
  vault: Vault;
  resource: { id: string; type: "Manifest" | "Collection" };
  data: Manifest | Collection;
};

export async function loadResource(url: string, signal?: AbortSignal): Promise<LoadedResource> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Resource request failed (${response.status})`);
  const data = await response.json();
  if (!data || typeof data.id !== "string" || !["Manifest", "Collection"].includes(data.type)) {
    throw new Error("Expected a IIIF Presentation 3 Manifest or Collection.");
  }
  const vault = new Vault();
  await vault.load(data.id, data);
  return { vault, resource: { id: data.id, type: data.type }, data };
}
