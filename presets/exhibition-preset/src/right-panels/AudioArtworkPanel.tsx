import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { EditingStackContext, LayoutActionsReactContext, ResourceEditingProvider, useLayoutActions } from "@manifest-editor/shell";
import { type ReactNode, useMemo } from "react";
import { CanvasContext, CanvasStrategyProvider, useCanvas, useVault } from "react-iiif-vault";
import { ensureAudioArtworkCanvas, getAudioArtworkCanvas, removeAudioArtworkCanvas } from "../audio-artwork";
import { useSlideshowWorkbenchState } from "../slideshow-content-positioning";
import { ExhibitionImagesContent } from "./ExhibitionImagesEditor";
import { AudioButton, AudioHint, AudioPanelSection, simpleLayoutColours } from "./AudioPanelParts";

/** Read-only selection scope: useEditor/useInStack target artwork without navigating away from the Sound slide. */
export function AudioArtworkCanvasScope({ canvasId, children }: { canvasId: string; children: ReactNode }) {
  const audio = useCanvas();
  const audioId = audio?.id;
  const actions = useLayoutActions();
  const current = useMemo(() => ({ resource: { type: "SpecificResource" as const, source: { id: canvasId, type: "Canvas" } } }), [canvasId]);
  const scopedActions = useMemo(() => ({ ...actions, edit: ((resource: any, context?: any, options?: any) => {
    const reference = resource?.source || resource;
    // The image panel's "return to single image" action normally navigates to its Canvas.
    // Keep the exhibition slide selected when that Canvas is only accompanying artwork.
    if (reference?.type === "Canvas" && reference.id === canvasId && audioId) {
      actions.edit({ id: audioId, type: "Canvas" }, undefined, { ...options, selectedTab: "@exhibition/audio-images" });
      return;
    }
    actions.edit(resource, context, options);
  }) as typeof actions.edit }), [actions, canvasId, audioId]);
  return (
    <LayoutActionsReactContext.Provider value={scopedActions}>
      <EditingStackContext.Provider value={{ current, stack: [], create: null }}>
      <CanvasContext canvas={canvasId}>
        <CanvasStrategyProvider key={canvasId} strategies={["images", "empty"]}>
          <ResourceEditingProvider resource={{ id: canvasId, type: "Canvas" }}>{children}</ResourceEditingProvider>
        </CanvasStrategyProvider>
      </CanvasContext>
      </EditingStackContext.Provider>
    </LayoutActionsReactContext.Provider>
  );
}

export function AudioArtworkPanel() {
  return <Sidebar><SidebarContent padding><AudioArtworkContent /></SidebarContent></Sidebar>;
}

export function AudioArtworkContent() {
  const canvas = useCanvas();
  const vault = useVault();
  const setMode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);
  const artwork = getAudioArtworkCanvas(vault, canvas);
  if (!canvas) return null;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: simpleLayoutColours.text }}>
          Accompanying images
        </h3>
        <AudioHint>
          Artwork shown with the recording. These images live on their own accompanying canvas, so the sound stays
          untouched. Use the Edit view to position them.
        </AudioHint>
      </div>
      {artwork ? (
        <>
          <AudioArtworkCanvasScope canvasId={artwork.id}>
            <ExhibitionImagesContent showSlideProportions={false} allowSwitchToMulti={false} />
          </AudioArtworkCanvasScope>
          <AudioPanelSection
            tone="plain"
            title="Remove artwork"
            description="Detaches the artwork from this recording. The recording, slide text and layout are kept."
          >
            <AudioButton variant="danger" className="self-start" onClick={() => removeAudioArtworkCanvas(vault, canvas)}>
              Remove accompanying images
            </AudioButton>
          </AudioPanelSection>
        </>
      ) : (
        <div
          className="rounded-md border border-dashed p-5"
          style={{ borderColor: simpleLayoutColours.fieldBorder, backgroundColor: simpleLayoutColours.fieldBackground }}
        >
          <p className="text-sm font-semibold" style={{ color: simpleLayoutColours.text }}>
            No artwork yet
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: simpleLayoutColours.muted }}>
            Without artwork the player shows a plain background. Add one or more images from a URL or the IIIF Browser.
          </p>
          <AudioButton
            variant="primary"
            className="mt-4"
            onClick={() => {
              ensureAudioArtworkCanvas(vault, canvas);
              setMode("edit");
            }}
          >
            Add accompanying images
          </AudioButton>
        </div>
      )}
    </div>
  );
}
