import { useEffect, useState } from "react";
import styled from "styled-components";
import { FlexContainerColumn, FlexContainerRow } from "./FlexContainer";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { Input } from "../form/Input";
import { useManifest } from "react-iiif-vault";

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
}> = ({ close, open, title }) => {
  const manifest = useManifest();
  const [helpers, setHelpers] = useState(null);

  // function getLabel(manifest: any) {
  //   return manifest.label ? getValue(manifest.label) : "";
  // }

  let helps = null;

  // required for next js ssr
  useEffect(() => {
    // helps = import("@iiif/vault-helpers");
  }, []);

  return (
    <>
      {open ? (
        <EditorPanelContainerOpen  justify={"space-between"} wide={true}>
          <FlexContainerRow justify="space-between">
            <h4>{title}</h4>
            <Button onClick={close}>
              <CloseIcon />
            </Button>
          </FlexContainerRow>
          <div>Manifest ID:</div>
          <div>{manifest && manifest.id ? manifest.id : "Unknown"}</div>
          <div>Manifest Label:</div>
          {/* <div>{helps && helps.getLabel ? helps.getLabel(manifest): ''}  </div> */}

          <Input />
        </EditorPanelContainerOpen>
      ) : (
        <></>
      )}
    </>
  );
};
