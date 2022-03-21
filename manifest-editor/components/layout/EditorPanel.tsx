import { useContext } from "react";
import { FlexContainerColumn, FlexContainerRow } from "./FlexContainer";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { LanguageMapInput } from "../form/LanguageMapInput";

import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import styled from "styled-components";
import { StringInput } from "../form/StringInput";
import { OpenFullscreen } from "../icons/OpenFullscreen";
import { CollapseFullscreen } from "../icons/CollapseFullscreen";
import { ManifestForm } from "../form/ManifestProperties/ManifestForm";
import { CanvasForm } from "../form/CanvasProperties/CanvasForm";

export const EditorPanelContainerOpen = styled(FlexContainerColumn)<{
  wide?: boolean;
}>`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  height: 100%;
  overflow-y: auto;
  width: ${(props: any) => (props.wide ? "100%" : "450px")};
  z-index: 12;
  background: ${(props: any) => props.theme.color.white || "white"};
  border-left: 1px solid rgba(5, 42, 68, 0.2);
  font-size: 0.85em;
  min-width: 400px;
  box-shadow: none;
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
`;

export const EditorPanel: React.FC<{
  open: boolean;
  close: () => void;
  languages: Array<string>;
}> = ({ close, open, languages }) => {
  const editorContext = useContext(ManifestEditorContext);

  return (
    <>
      {open ? (
        <EditorPanelContainerOpen
          justify={"space-between"}
          wide={editorContext?.view === "fullEditor"}
        >
          <div>
            <FlexContainerRow justify="space-between">
              <h4>{editorContext?.selectedProperty} properties</h4>
              <Button onClick={close}>
                <CloseIcon />
              </Button>
            </FlexContainerRow>
            {editorContext?.selectedProperty === "manifest" && <ManifestForm />}
            {editorContext?.selectedProperty === "canvas" && <CanvasForm />}
            {/*
            {(editorContext?.selectedProperty === "type" ||
              editorContext?.selectedProperty === "viewingDirection" ||
              editorContext?.selectedProperty === "@context") && (
              <StringInput dispatchType={editorContext?.selectedProperty} />
            )} */}
            {/* {(editorContext?.selectedProperty === "label" ||
              editorContext?.selectedProperty === "summary") && (
              <LanguageMapInput
                dispatchType={editorContext?.selectedProperty}
                languages={languages}
              />
            )} */}
          </div>
          <FlexContainerRow justify="flex-end">
            {editorContext?.view === "fullEditor" ? (
              <Button
                onClick={() => editorContext?.setView("tree")}
                title="close"
              >
                <CollapseFullscreen />
              </Button>
            ) : (
              <Button
                onClick={() => editorContext?.setView("fullEditor")}
                title="Expand to full"
              >
                <OpenFullscreen />
              </Button>
            )}
          </FlexContainerRow>
        </EditorPanelContainerOpen>
      ) : (
        <></>
      )}
    </>
  );
};
