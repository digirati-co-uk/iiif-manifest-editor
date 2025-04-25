import { Vault, createThumbnailHelper } from "@iiif/helpers";
import type { CreateImageUrlPayload } from "@manifest-editor/creators";
import { PreviewVaultBoundary } from "@manifest-editor/shell";
import { IIIFBrowser, type IIIFBrowserProps } from "iiif-browser";
import { useMemo } from "react";

export function PreviewManifestInBrowser({
  id,
  type = "Manifest",
  setThumbnail,
}: {
  id: string;
  type?: string;
  setThumbnail?: (thumbnail: CreateImageUrlPayload) => void;
}) {
  const vault = useMemo(() => new Vault(), []);
  const thumbnailHelper = useMemo(() => createThumbnailHelper(vault), [vault]);
  const output = useMemo(() => {
    return [
      {
        type: "callback",
        label: "Set as thumbnail",
        supportedTypes: setThumbnail ? ["Canvas"] : [],
        cb: async (resource) => {
          const canvas = vault.get(resource);
          // @todo handle set as thumbnail.
          // Need to get the Manifest and grab the thumbnail from it.
          const thumbnail: any = await thumbnailHelper.getBestThumbnailAtSize(canvas, { width: 256, height: 256 });
          if (thumbnail.best) {
            setThumbnail?.({
              url: thumbnail.best.id,
              format: "image/jpeg",
              width: thumbnail.best.width,
              height: thumbnail.best.height,
            });
          }
        },
        format: { type: "custom", format: (f) => f },
      },
    ] as IIIFBrowserProps["output"];
  }, [thumbnailHelper, vault, setThumbnail]);

  const navigationOptions = useMemo(() => {
    return {
      canCropImage: false,
      canSelectCanvas: true,
      canSelectManifest: true,
      canSelectCollection: true,
      // @todo fix the output so this one works.
      multiSelect: false,
      allowNavigationToBuiltInPages: false,
    } as IIIFBrowserProps["navigation"];
  }, []);

  const uiOptions = useMemo(() => {
    return {
      homeLink: id,
      buttonClassName: "bg-me-primary-500 text-white hover:bg-me-primary-600",
    } as IIIFBrowserProps["ui"];
  }, [id]);

  const historyOptions = useMemo(() => {
    return {
      saveToLocalStorage: false,
      restoreFromLocalStorage: false,
      initialHistory: [
        {
          url: id,
          resource: id,
          route: `/loading?id=${id}`,
          metadata: { type: type },
        },
      ],
    } as IIIFBrowserProps["history"];
  }, [id, type]);

  return (
    <PreviewVaultBoundary>
      <IIIFBrowser
        debug
        ui={uiOptions}
        vault={vault}
        history={historyOptions}
        className="iiif-browser border-none border-t rounded-none h-[70vh] min-h-[60vh] max-h-full max-w-full"
        output={output}
        navigation={navigationOptions}
      />
    </PreviewVaultBoundary>
  );
}
