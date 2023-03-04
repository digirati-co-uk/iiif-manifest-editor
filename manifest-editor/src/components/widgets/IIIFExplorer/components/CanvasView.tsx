import { useExplorerStore } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { useStore } from "zustand";
import {
  AnnotationContext,
  CanvasContext,
  CanvasPanel,
  ManifestContext,
  useCanvas,
  useManifest,
  useVaultSelector,
} from "react-iiif-vault";
import { CanvasNormalized } from "@iiif/presentation-3";
import React, { useMemo, useReducer, useState } from "react";
import { MediaControls } from "@/_panels/center-panels/CanvasPanelViewer/components/MediaControls";
import invariant from "tiny-invariant";
import { ViewerContainer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer.styles";
import { ViewControls } from "@/_panels/center-panels/CanvasPanelViewer/components/ViewControls";
import { BoxStyle, DrawBox } from "@atlas-viewer/atlas";
import { RegionHighlight } from "@/madoc/components/BoxSelector.Atlas";
import { CanvasContainer } from "@/components/widgets/IIIFExplorer/styles/CanvasView.styles";

interface CanvasInnerViewProps {
  highlightStyle?: BoxStyle;
  regionEnabled?: boolean;
}

export function CanvasViewInner({ highlightStyle, regionEnabled }: CanvasInnerViewProps) {
  const manifest = useManifest();
  const canvas = useCanvas();
  const [editMode, setEditMode] = useState(false);
  const store = useExplorerStore();
  const setCurrentSelector = useStore(store, (s) => s.setCurrentSelector);
  const selected = useStore(store, (s) => s.selected);
  const replace = useStore(store, (s) => s.replace);

  // "Edit mode" if CanvasRegion or ImageServiceRegion is supported
  // Need new state for the box?

  invariant(canvas);

  const index = useMemo(() => {
    return manifest ? manifest.items.findIndex((c) => c.id === canvas.id) : -1;
  }, [canvas.id, manifest]);

  const next = useMemo(() => {
    return index !== -1 ? manifest?.items[index + 1] : undefined;
  }, [index, manifest]);
  const prev = useMemo(() => {
    return index !== -1 ? manifest?.items[index - 1] : undefined;
  }, [index, manifest]);

  return (
    <div className={CanvasContainer}>
      <CanvasPanel.Viewer
        key={canvas.id}
        // onCreated={(preset) => void (runtime.current = preset.runtime)}
        // renderPreset={config}
        mode={editMode ? "sketch" : "explore"}
      >
        <CanvasContext canvas={canvas.id}>
          <CanvasPanel.RenderCanvas
            strategies={["empty", "images", "media", "textual-content"]}
            renderViewerControls={() => (
              <ViewControls
                editMode={editMode}
                enableNavigation={index !== -1}
                toggleEditMode={regionEnabled ? () => setEditMode((e) => !e) : undefined}
                onNext={next ? () => replace(next) : undefined}
                onPrevious={prev ? () => replace(prev) : undefined}
                clearSelection={() => setCurrentSelector(undefined)}
                style={{ fontSize: "0.85em" }}
              />
            )}
            viewControlsDeps={[regionEnabled, editMode, index, next, prev]}
            renderMediaControls={() => <MediaControls />}
            backgroundStyle={{ background: "#fff" }}
            alwaysShowBackground
            // onClickPaintingAnnotation={onClickPaintingAnnotation}
          >
            {editMode && !selected?.selector ? (
              <DrawBox
                onCreate={(bounds) => {
                  if (canvas) {
                    setCurrentSelector({ type: "BoxSelector", spatial: bounds });
                    setEditMode(false);
                  }
                }}
              />
            ) : null}

            {selected?.selector && selected?.selector.type === "BoxSelector" ? (
              <RegionHighlight
                region={{ ...selected?.selector.spatial } as any}
                isEditing={true}
                onSave={(bounds) => setCurrentSelector({ type: "BoxSelector", spatial: bounds })}
                style={
                  highlightStyle ? highlightStyle : { border: "1px solid red", background: "rgba(255, 255, 255, .1)" }
                }
                disableCardinalControls
                onClick={() => void 0}
              />
            ) : null}

            {/*{!currentlyEditingAnnotation && resources.length*/}
            {/*  ? resources.map((resource) => <Highlight key={resource} id={resource} />)*/}
            {/*  : null}*/}
            {/*{currentlyEditingAnnotation && editMode ? (*/}
            {/*  <AnnotationContext annotation={currentlyEditingAnnotation}>*/}
            {/*    <AnnotationTargetEditor />*/}
            {/*  </AnnotationContext>*/}
            {/*) : null}*/}
          </CanvasPanel.RenderCanvas>
        </CanvasContext>
        {/*{rightPanel.current === "canvas-properties" && rightPanel.state.current === 5 && (*/}
        {/*  <Annotations canvasId={state.canvasId} />*/}
        {/*)}*/}
      </CanvasPanel.Viewer>
    </div>
  );
}

export function CanvasView(props: CanvasInnerViewProps) {
  const store = useExplorerStore();
  const selected = useStore(store, (s) => s.selected);
  const previous = useStore(store, (s) => {
    return s.history.length > 1 ? s.history[s.history.length - 2] : undefined;
  });

  if (!selected || selected.type !== "Canvas" || !selected.id) {
    return null;
  }

  const canvas = (
    <CanvasContext canvas={selected.id}>
      <CanvasViewInner {...props} />
    </CanvasContext>
  );

  if (previous && previous.type === "Manifest") {
    return <ManifestContext manifest={previous.id}>{canvas}</ManifestContext>;
  }

  return canvas;
}
