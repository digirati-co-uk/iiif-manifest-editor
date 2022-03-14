import { useContext } from "react";
import { FlexContainerColumn, FlexContainerRow } from "./FlexContainer";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { LanguageMapInput } from "../form/LanguageMapInput";

import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";

import styled from "styled-components";
import { StringInput } from "../form/StringInput";

export const EditorPanelContainerOpen = styled(FlexContainerColumn)<{
  wide?: boolean;
}>`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  height: 100%;
  overflow-y: auto;
  z-index: 12;
  background: ${(props: any) => props.theme.color.white || "white"};
  border-left: 1px solid rgba(5, 42, 68, 0.2);
  font-size: 0.85em;
  line-height: 1.3em;
  border-radius: 0;
  min-width: 350px;
  box-shadow: none;
  max-width: ${(props: any) => (props.wide ? "550px" : "450px")};
  margin-bottom: 0.8em;
  &:focus {
    border-color: #333;
    outline: none;
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
        <EditorPanelContainerOpen justify={"flex-start"} wide={true}>
          <FlexContainerRow justify="space-between">
            <h4>Edit {editorContext?.selectedProperty}</h4>
            <Button onClick={close}>
              <CloseIcon />
            </Button>
          </FlexContainerRow>
          {(editorContext?.selectedProperty === "id" ||
            editorContext?.selectedProperty === "type" ||
            editorContext?.selectedProperty === "viewingDirection" ||
            editorContext?.selectedProperty === "@context") && (
            <StringInput dispatchType={editorContext?.selectedProperty} />
          )}
          {(editorContext?.selectedProperty === "label" ||
            editorContext?.selectedProperty === "summary") && (
            <LanguageMapInput
              dispatchType={editorContext?.selectedProperty}
              languages={languages}
            />
          )}
        </EditorPanelContainerOpen>
      ) : (
        <></>
      )}
    </>
  );
};
