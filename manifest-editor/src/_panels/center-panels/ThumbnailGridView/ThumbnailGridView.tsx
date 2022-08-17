import { GridView } from "@/components/organisms/GridView/GridView";

export function ThumbnailGridView({
  onChangeCanvas,
  canvasIds,
  clearCanvases,
}: {
  canvasIds?: string[];
  clearCanvases?: (() => void) | undefined;
  onChangeCanvas: (canvasId: string, thumbnails?: boolean) => void;
}) {
  return (
    <GridView
      canvasIds={canvasIds}
      clearCanvases={canvasIds ? clearCanvases : undefined}
      handleChange={onChangeCanvas}
    />
  );
}
