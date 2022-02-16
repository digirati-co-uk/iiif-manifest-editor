import styled from "styled-components";
import { FlexContainerColumn, FlexContainerRow } from "./FlexContainer";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { LanguageMapInput } from "../form/LanguageMapInput";
import { useManifest } from "react-iiif-vault";
import { AddIcon } from "../icons/AddIcon";

export const EditorPanelContainerOpen = styled(FlexContainerColumn)<{
  wide?: boolean;
}>`
  position: fixed;
  right: 0;
  height: 100%;
  z-index: 12;
  background: white;
  overflow-y: scroll;
  border-left: 1px solid rgba(5, 42, 68, 0.2);
  padding: 0.7em 0.9em;
  font-size: 0.85em;
  line-height: 1.3em;
  border-radius: 0;
  width: 100%;
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
  title: string;
  languages: Array<string>;
}> = ({ close, open, title, languages }) => {

  return (
    <>
      {open ? (
        <EditorPanelContainerOpen justify={"flex-start"} wide={true}>
          <FlexContainerRow justify="space-between">
            <h4>{title}</h4>
            <Button onClick={close}>
              <CloseIcon />
            </Button>
          </FlexContainerRow>
          <LanguageMapInput
            dispatchType={"label"}
            languages={languages}
          />
        </EditorPanelContainerOpen>
      ) : (
        <></>
      )}
    </>
  );
};
