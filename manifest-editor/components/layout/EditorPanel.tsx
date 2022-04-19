import { useContext, useState } from "react";
import { FlexContainerColumn, FlexContainerRow } from "./FlexContainer";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { LanguageMapInput } from "../form/LanguageMapInput";

import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import styled, { css } from "styled-components";
import { OpenFullscreen } from "../icons/OpenFullscreen";
import { CollapseFullscreen } from "../icons/CollapseFullscreen";
import { ManifestForm } from "../form/ManifestProperties/ManifestForm";
import { CanvasForm } from "../form/CanvasProperties/CanvasForm";
import { ModalHeader } from "../atoms/ModalHeader";
import { BackIcon } from "../icons/BackIcon";

export const EditorPanelContainerOpen = styled(FlexContainerColumn)<{
  wide?: boolean;
}>`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  height: 100%;
  z-index: 12;
  width: 500px:
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
      z-index: 15;
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
  languages: Array<string>;
}> = ({ close, open }) => {
  const editorContext = useContext(ManifestEditorContext);
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <>
      {open && (
        <EditorPanelContainerOpen justify={"space-between"} wide={fullScreen}>
          <div>
            <FlexContainerRow
              justify="space-between"
              style={{ alignItems: "center" }}
            >
              {editorContext?.selectedProperty === "canvas" && (
                <Button
                  onClick={() =>
                    editorContext?.changeSelectedProperty("manifest")
                  }
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
            {editorContext?.selectedProperty === "manifest" && <ManifestForm />}
            {editorContext?.selectedProperty === "canvas" && <CanvasForm />}
          </div>
          <FlexContainerRow justify="flex-end">
            {fullScreen ? (
              <Button
                onClick={() => setFullScreen(false)}
                title="close"
                aria-label="collapse fullscreen"
              >
                <CollapseFullscreen />
              </Button>
            ) : (
              <Button
                onClick={() => setFullScreen(true)}
                title="Expand to full"
                aria-label="expand to fullscreen"
              >
                <OpenFullscreen />
              </Button>
            )}
          </FlexContainerRow>
        </EditorPanelContainerOpen>
      )}
    </>
  );
};
