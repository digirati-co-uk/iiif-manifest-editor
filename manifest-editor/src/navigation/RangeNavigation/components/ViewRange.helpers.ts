import { Vault } from "@iiif/vault";
import { ManifestNormalized, RangeNormalized, Reference } from "@iiif/presentation-3";

export function findFirstCanvasFromRange(vault: Vault, range: RangeNormalized): null | Reference<"Canvas"> {
  for (const inner of range.items) {
    if (inner.type === "Canvas") {
      return inner as Reference<"Canvas">;
    }
    if (inner.type === "Range") {
      const found = findFirstCanvasFromRange(vault, vault.get(inner));
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function findAllCanvasesInRange(vault: Vault, range: RangeNormalized): Array<Reference<"Canvas">> {
  const found = [];
  for (const inner of range.items) {
    if (inner.type === "Canvas") {
      found.push(inner as Reference<"Canvas">);
    }
    if (inner.type === "Range") {
      found.push(...findAllCanvasesInRange(vault, vault.get(inner)));
    }
  }
  return found;
}

export function findManifestSelectedRange(
  vault: Vault,
  manifest: ManifestNormalized,
  canvasId: string
): null | RangeNormalized {
  for (const range of manifest.structures) {
    const found = findSelectedRange(vault, vault.get(range), canvasId);
    if (found) {
      return found;
    }
  }

  return null;
}

export function findSelectedRange(vault: Vault, range: RangeNormalized, canvasId: string): null | RangeNormalized {
  for (const inner of range.items) {
    const parsedId = inner.id?.split("#")[0];
    if (inner.type === "Canvas" && canvasId === parsedId) {
      return range;
    }
    if (inner.type === "Range") {
      const found = findSelectedRange(vault, vault.get(inner), canvasId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
