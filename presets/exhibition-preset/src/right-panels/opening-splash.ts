import type { Vault } from "@iiif/helpers/vault";
import type { EditableResource } from "@manifest-editor/shell";

type CanvasLike = { id: string; behavior?: string[] | null };
type ManifestItem = { id: string };

export function isOpeningSplashCanvas(
  canvas: CanvasLike | null | undefined,
  items: ManifestItem[] | null | undefined,
) {
  return Boolean(
    canvas &&
      items?.[0]?.id === canvas.id &&
      canvas.behavior?.includes("splash"),
  );
}

export function isOpeningSplashResource(
  resource: EditableResource,
  vault: Vault,
) {
  const canvas = vault.get(resource.resource) as CanvasLike | undefined;
  const manifest = resource.parent
    ? (vault.get(resource.parent) as { items?: ManifestItem[] } | undefined)
    : undefined;

  return isOpeningSplashCanvas(canvas, manifest?.items);
}
