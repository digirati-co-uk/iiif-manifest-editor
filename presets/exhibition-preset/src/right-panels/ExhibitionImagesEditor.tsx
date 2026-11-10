import { CanvasBackgroundColorField } from "../components/CanvasBackgroundColorField";
import { Sidebar, SidebarContent } from "@manifest-editor/components";
import {
  CanvasLayoutSection,
  CanvasCompositionSession,
  SmartCanvasSize,
  PaintingAnnotationList,
  CanvasImageMode,
  ActionPill,
  useAddCanvasImage,
} from "@manifest-editor/editors";
import {
  beginCanvasComposition,
  isTemplateManaged,
  canResizeCanvas,
  getPaintingImages,
  targetPaintingImageRegion,
  switchToSingleImage,
} from "@manifest-editor/editor-api";
import { type EditorDefinition, useEditor, useLayoutActions } from "@manifest-editor/shell";
import { AnnotationPageContext, useCanvas, useVault, useVaultSelector, useAtlasStore } from "react-iiif-vault";
import { getHeightWidthRatio, isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import { useSlideshowWorkbenchState } from "../slideshow-content-positioning";

export const exhibitionImagesEditor: EditorDefinition = {
  id: "@exhibition/images",
  label: "Images",
  supports: {
    edit: true,
    resourceTypes: ["Canvas"],
    properties: ["items", "width", "height"],
    custom: ({ resource }, vault) =>
      isEditableExhibitionCanvas(resource as any, vault) && !isInfoBoxCanvas(resource as any, vault),
  },
  component: () => (
    <Sidebar>
      <SidebarContent padding>
        <ExhibitionImagesContent />
      </SidebarContent>
    </Sidebar>
  ),
};

export function ExhibitionImagesContent() {
  const canvas = useCanvas();
  const vault = useVault();
  const add = useAddCanvasImage();
  const { technical } = useEditor();
  const { edit } = useLayoutActions();
  const store = useAtlasStore();
  const images = useVaultSelector((_, v) => (canvas ? getPaintingImages(v, canvas) : []), [canvas]);
  const setMode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);
  if (!canvas) return null;
  const page = canvas.items[0];
  const ratio = getHeightWidthRatio(canvas.behavior).ratio;
  const mismatch = Math.abs(canvas.width / canvas.height - ratio) >= 0.01;
  const singleImage = !canResizeCanvas(vault, canvas);
  function cancelSelection() {
    const state = store.getState();
    if (state.tool.requestId && state.requests[state.tool.requestId]?.arguments?.canvasComposition)
      state.cancelRequest(state.tool.requestId);
  }
  const addImage = () => {
    setMode("edit");
    return add();
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CanvasImageMode
        singleImage={singleImage}
        canReturnToSingle={images.length === 1}
        onSwitchToMulti={() => {
          beginCanvasComposition(vault, canvas);
          if (images[0]) targetPaintingImageRegion(vault, canvas, images[0].id);
          setMode("edit");
        }}
        onSwitchToSingle={() => {
          cancelSelection();
          switchToSingleImage(vault, canvas);
          edit(canvas, undefined, { selectedTab: "@exhibition/images", forceOpen: true });
        }}
      >
        <CanvasLayoutSection />
        <SmartCanvasSize templateAware>
          {({ resize }) =>
            mismatch ? (
              <p
                style={{
                  margin: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#fffaeb",
                  border: "1px solid #fedf89",
                  color: "#93370d",
                }}
              >
                <span>Slide proportions differ from the slide format.</span>
                <ActionPill
                  variant="secondary"
                  onClick={() => resize({ x: 0, y: 0, width: canvas.width, height: Math.round(canvas.width / ratio) })}
                >
                  Match slide
                </ActionPill>
              </p>
            ) : null
          }
        </SmartCanvasSize>
      </CanvasImageMode>
      {singleImage && <CanvasCompositionSession />}
      <CanvasBackgroundColorField editor={technical.backgroundColor} />
      {isTemplateManaged(vault, canvas) ? null : page ? (
        <AnnotationPageContext annotationPage={page.id}>
          <PaintingAnnotationList onCreate={() => void addImage()} />
        </AnnotationPageContext>
      ) : (
        <button
          type="button"
          onClick={() => void addImage()}
          className="rounded px-3 py-2 text-sm"
          style={{ background: "#b84c74", color: "white" }}
        >
          + Add image
        </button>
      )}
    </div>
  );
}
