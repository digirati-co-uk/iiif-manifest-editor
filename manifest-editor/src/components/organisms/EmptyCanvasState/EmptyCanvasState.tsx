import { FloatingPanel, FloatingPanelContainer, FloatingPanelInner, TextOverlay } from "./EmptyCanvasState.styles";
import { UniversalCopyTarget } from "@/shell";
import { usePasteCanvas } from "@/hooks/usePasteCanvas";

export function EmptyCanvasState() {
  const onPasteCanvas = usePasteCanvas();

  return (
    <UniversalCopyTarget style={{ flex: 1, background: "#fff" }} onPasteAnalysis={onPasteCanvas}>
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
