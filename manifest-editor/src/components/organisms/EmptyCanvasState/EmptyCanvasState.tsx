import { FloatingPanel, FloatingPanelContainer, FloatingPanelInner, TextOverlay } from "./EmptyCanvasState.styles";
import { UniversalCopyTarget } from "../../../shell/Universal/UniversalCopyPaste";
import { createCanvasFromImage } from "../../../iiif-builder-extensions/create-canvas-from-image";
import { useResourceContext, useVault } from "react-iiif-vault";
import { useMemo } from "react";
import { IIIFBuilder } from "iiif-builder";
import { useCanvasSubset } from "../../../hooks/useCanvasSubset";
import { useManifestEditor } from "../../../apps/ManifestEditor/ManifestEditor.context";

export function EmptyCanvasState() {
  const vault = useVault();
  const builder = useMemo(() => new IIIFBuilder(vault), [vault]);
  const ctx = useResourceContext();

  return (
    <UniversalCopyTarget
      style={{ flex: 1, background: "#fff" }}
      onPasteAnalysis={(result) => {
        if (ctx.manifest && result.type === "Image") {
          createCanvasFromImage(builder, ctx.manifest, result);
        }
      }}
    >
      <div
        style={{
          overflow: "hidden",
          display: "flex",
          position: "relative",
          justifyContent: "center",
          background: "#fff",
        }}
      >
        <FloatingPanelContainer $reverse>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
        </FloatingPanelContainer>
        <FloatingPanelContainer>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
        </FloatingPanelContainer>
        <FloatingPanelContainer $reverse>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
        </FloatingPanelContainer>
        <FloatingPanelContainer>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
          <FloatingPanel>
            <FloatingPanelInner />
          </FloatingPanel>
        </FloatingPanelContainer>
        <TextOverlay style={{ textAlign: "center" }}>
          <h1>No canvases</h1>
        </TextOverlay>
      </div>
    </UniversalCopyTarget>
  );
}
