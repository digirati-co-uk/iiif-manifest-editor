import type { BoxSelector } from "@iiif/helpers";
import type { IIIFBrowserProps } from "iiif-browser";

type IIIFBrowserCustomFormat = Extract<NonNullable<IIIFBrowserProps["output"]>[number]["format"], { type: "custom" }>;

export type IIIFBrowserSelectedItem = Parameters<IIIFBrowserCustomFormat["format"]>[0];

export interface IIIFBrowserOutputItem {
  resource: any;
  parent: IIIFBrowserSelectedItem["parent"];
  selector: IIIFBrowserSelectedItem["selector"];
  rotation: IIIFBrowserSelectedItem["rotation"];
}

export function formatIIIFBrowserOutput(
  resource: IIIFBrowserSelectedItem | IIIFBrowserSelectedItem[],
  parent: IIIFBrowserSelectedItem | null,
  vault: Parameters<IIIFBrowserCustomFormat["format"]>[2],
): IIIFBrowserOutputItem[] {
  const selectedItems = Array.isArray(resource)
    ? resource
    : [{ ...resource, parent: resource.parent ?? parent ?? undefined }];

  return selectedItems.map((item) => ({
    resource: vault.get(item),
    parent: item.parent,
    selector: item.selector,
    rotation: item.rotation,
  }));
}

export function browserImageApiSelector(selector: BoxSelector | undefined, rotation: number | undefined) {
  const region =
    selector?.type === "BoxSelector"
      ? [~~selector.spatial.x, ~~selector.spatial.y, ~~selector.spatial.width, ~~selector.spatial.height].join(",")
      : undefined;

  if (!region && !rotation) return undefined;

  return {
    type: "ImageApiSelector" as const,
    ...(region ? { region } : {}),
    ...(rotation ? { rotation: `${rotation}` } : {}),
  };
}

export function browserTransformDimensions(
  dimensions: { width: number; height: number },
  rotation: number | undefined,
) {
  const angle = Number.isFinite(rotation) ? (((rotation as number) % 360) + 360) % 360 : 0;
  return angle === 90 || angle === 270 ? { width: dimensions.height, height: dimensions.width } : dimensions;
}
