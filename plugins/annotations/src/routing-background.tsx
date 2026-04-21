import { useInStack } from "@manifest-editor/editors";
import { type BackgroundPanel, useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import { useEffect, useRef, useState } from "react";
import { useManifest } from "react-iiif-vault";
import { ANNOTATIONS_LEFT_PANEL_ID } from "./constants";

const RANGES_PANEL_ID = "@manifest-editor/ranges-listing";

export const annotationRoutingBackground: BackgroundPanel = {
  id: "@manifest-editor/annotations-routing",
  label: "Annotation routing",
  render: () => <AnnotationRoutingBackground />,
};

function AnnotationRoutingBackground() {
  const manifest = useManifest();
  const canvas = useInStack("Canvas");
  const { leftPanel, rightPanel } = useLayoutState();
  const { edit, open, rightPanel: rightPanelActions } = useLayoutActions();
  const lastCanvas = useRef<string | null>(null);
  const [closedRightPanel, setClosedRightPanel] = useState(false);

  useEffect(() => {
    const canvasId = canvas?.resource?.source?.id;
    if (canvasId) {
      lastCanvas.current = canvasId;
    }
  }, [canvas?.resource?.source?.id]);

  useEffect(() => {
    if (leftPanel.current === ANNOTATIONS_LEFT_PANEL_ID) {
      const firstCanvas = lastCanvas.current || manifest?.items?.[0]?.id;
      if (firstCanvas) {
        open({ id: "current-canvas" });
        edit({ id: firstCanvas, type: "Canvas" });
      }

      if (rightPanel.open) {
        rightPanelActions.close();
        setClosedRightPanel(true);
      }
      return;
    }

    if (closedRightPanel && !rightPanel.open && leftPanel.current !== RANGES_PANEL_ID) {
      rightPanelActions.open();
      setClosedRightPanel(false);
    }
  }, [leftPanel.current]);

  return null;
}
