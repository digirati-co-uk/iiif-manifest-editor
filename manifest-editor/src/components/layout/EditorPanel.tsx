import { useContext, useState } from "react";
import { FlexContainerColumn, FlexContainerRow } from "./FlexContainer";
import { Button } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";

import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";

import styled, { css } from "styled-components";
import { OpenFullscreen } from "../../icons/OpenFullscreen";
import { CollapseFullscreen } from "../../icons/CollapseFullscreen";
import { ManifestProperties } from "../../_panels/center-panels/ManifestProperties/ManifestProperties";
import { CanvasForm } from "../../editors/CanvasProperties/CanvasForm";
import { ModalHeader } from "../../atoms/ModalHeader";
import { BackIcon } from "../../icons/BackIcon";
import { MediaForm } from "../../editors/MediaProperties/MediaForm";
import { CanvasThumbnailForm } from "../../editors/ThumbnailProperties/CanvasThumbnailForm";
import { ManifestThumbnailForm } from "../../editors/ThumbnailProperties/ManifestThumbnailForm";

export const EditorPanelContainerOpen = styled(FlexContainerColumn)<{
  wide?: boolean;
}>`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  height: 100%;
  z-index: 12;
  background: ${(props: any) => props.theme.color.white || "white"};
  border-left: 1px solid rgba(5, 42, 68, 0.2);
  font-size: 0.85em;
  margin-bottom: 0.8em;
  &:focus {
    border-color: #333;
    outline: none;
  }
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    width: 100%;
    border-top: 1px solid rgba(5, 42, 68, 0.2);
    border-left: none;
  }
  ${(props: any) =>
    props.wide &&
    css`
      z-index: 14;
      width: 98%;
      position: absolute;
      background-color: white;
      height: 85vh;
      border-left: none;
    `};
`;

export const EditorPanel: React.FC<{
  open: boolean;
  close: () => void;
}> = ({ close, open }) => {
  const editorContext = useManifestEditor();
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <>
      {open && (
        <EditorPanelContainerOpen justify={"space-between"} wide={fullScreen}>
          <div style={{ width: fullScreen ? "unset" : "40vw" }}>
            <FlexContainerRow justify="space-between" style={{ alignItems: "center" }}>
              {editorContext?.selectedProperty === "canvas" && (
                <Button
                  onClick={() => editorContext?.changeSelectedProperty("manifest")}
                  aria-label="go back to manifest properties"
                >
                  <BackIcon />
                </Button>
              )}
              {editorContext?.selectedProperty === "canvas item" && (
                <Button
                  onClick={() => editorContext?.changeSelectedProperty("canvas", 2)}
                  aria-label="go back to canvas properties"
                >
                  <BackIcon />
                </Button>
              )}
              {editorContext?.selectedProperty === "canvas thumbnail" && (
                <Button
                  onClick={() => editorContext?.changeSelectedProperty("canvas", 2)}
                  aria-label="go back to canvas properties"
                >
                  <BackIcon />
                </Button>
              )}
              {editorContext?.selectedProperty === "manifest thumbnail" && (
                <Button
                  onClick={() => editorContext?.changeSelectedProperty("manifest", 0)}
                  aria-label="go back to manifest properties"
                >
                  <BackIcon />
                </Button>
              )}
              <ModalHeader $color={editorContext?.selectedProperty}>
                {editorContext?.selectedProperty} properties
              </ModalHeader>
              <Button aria-label="close-panel" onClick={close}>
                <CloseIcon />
              </Button>
            </FlexContainerRow>
            {editorContext?.selectedProperty === "manifest" && (
              <ManifestProperties
                current={editorContext.selectedPanel || 0}
                setCurrent={(idx) => editorContext?.changeSelectedProperty("manifest", idx)}
              />
            )}
            {editorContext?.selectedProperty === "canvas" && (
              <CanvasForm
                current={editorContext?.selectedPanel || 0}
                setCurrent={(idx) => editorContext?.changeSelectedProperty("canvas", idx)}
              />
            )}
            {editorContext?.selectedProperty === "canvas item" && <MediaForm />}
            {editorContext?.selectedProperty === "canvas thumbnail" && <CanvasThumbnailForm />}
            {editorContext?.selectedProperty === "manifest thumbnail" && <ManifestThumbnailForm />}
          </div>
          <FlexContainerRow justify="flex-end">
            {fullScreen ? (
              <Button onClick={() => setFullScreen(false)} title="close" aria-label="collapse fullscreen">
                <CollapseFullscreen />
              </Button>
            ) : (
              <Button onClick={() => setFullScreen(true)} title="Expand to full" aria-label="expand to fullscreen">
                <OpenFullscreen />
              </Button>
            )}
          </FlexContainerRow>
        </EditorPanelContainerOpen>
      )}
    </>
  );
};
