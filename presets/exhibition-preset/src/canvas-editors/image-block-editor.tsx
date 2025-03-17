import { ActionButton } from "@manifest-editor/components";
import {
  CanvasPanelEditor,
  useInStack,
  useToggleList,
} from "@manifest-editor/editors";
import type {
  CanvasEditorDefinition,
  LayoutPanel,
} from "@manifest-editor/shell";
import { useLocalStorage } from "@manifest-editor/ui/madoc/use-local-storage";
import { Button } from "react-aria-components";
import {
  CanvasContext,
  LocaleString,
  type RenderingStrategy,
  useCanvas,
} from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { getClassName, getGridStats } from "../helpers";

export const imageBlockEditor: CanvasEditorDefinition = {
  id: "image-block-editor",
  label: "Image Block Editor",
  component: (strategy) => <ImageBlockEditor strategy={strategy} />,
  supports: {
    strategy: (strategy, resource, vault) => {
      if (strategy.type !== "images") {
        return false;
      }

      const fullResource = vault.get(resource.resource);
      if (fullResource.type !== "Canvas") {
        return false;
      }

      const behaviors = fullResource.behavior || [];

      let isImage = false;
      for (const behaviour of behaviors) {
        if (
          behaviour.startsWith("w-") ||
          behaviour.startsWith("h-") ||
          behaviour === "image"
        ) {
          isImage = true;
        }
      }

      return isImage;
    },
  },
};

export function ImageBlockEditor({
  strategy,
}: { strategy: RenderingStrategy }) {
  const [isPreview, setIsPreview] = useLocalStorage("exhibition-preview-mode");
  const canvas = useInStack("Canvas");
  if (!canvas) {
    return null;
  }

  return (
    <CanvasContext canvas={canvas.resource.source?.id}>
      <div className="flex gap-4 bg-me-500 py-2 px-4 text-white shadow-md z-40 ring-1 ring-me-500 items-center">
        Switch view
        <ActionButton onPress={() => setIsPreview(!isPreview)}>
          {isPreview ? "Full canvas" : "Layout preview"}
        </ActionButton>
      </div>
      {isPreview ? (
        <div className="grid grid-cols-12 grid-rows-12 h-full bg-white">
          <ImageBlockRenderer />
        </div>
      ) : (
        <div className="h-full flex flex-1 min-h-0">
          <CanvasPanelEditor asFallback />
        </div>
      )}
    </CanvasContext>
  );
}

function ImageBlockRenderer() {
  const canvas = useCanvas();
  const behavior = canvas?.behavior || [];
  const className = getClassName(behavior);
  const { isBottom, isImage, isInfo, isLeft } = getGridStats(canvas?.behavior);

  return (
    <div
      className={twMerge(
        className,
        "flex h-full max-h-full min-h-0",
        isLeft ? "flex-row-reverse" : isBottom ? "flex-col" : "flex-row",
      )}
    >
      <div className="flex-1 h-full flex min-w-0">
        <CanvasPanelEditor asFallback />
      </div>
      {!isImage ? (
        <div
          className={`${isBottom ? "min-h-3 w-full" : "w-1/3"} flex-shrink-0 self-stretch text-white bg-black rounded p-8`}
        >
          <LocaleString className="block mb-4">{canvas?.label}</LocaleString>
          <LocaleString>{canvas?.summary}</LocaleString>
        </div>
      ) : null}
    </div>
  );
}
