import { getValue } from "@iiif/vault-helpers";
import { useContext, useState } from "react";

import { Container, ContainerColumn, KeyValuePairString, Expanded, KeyCanvas, Indentation } from "./IIIFElementsShared";

import { DownIcon } from "../../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { useCanvas, useVault } from "react-iiif-vault";
import { SubdirectoryIcon } from "../../icons/SubdirectoryIcon";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { useShell } from "../../context/ShellContext/ShellContext";

export const IIIFCanvas: React.FC<{
  type: string;
  id: string;
  onClick: () => void;
}> = ({ type, id, onClick }) => {
  const canvas = useCanvas({ id: id });
  const label = getValue(canvas?.label);
  const [open, setOpen] = useState(false);
  const vault = useVault();
  const shellContext = useShell();
  const editorContext = useManifestEditor();
  return (
    <>
      <Container
        onClick={() => {
          shellContext.setCurrentCanvasId(id);
          setOpen(!open);
        }}
      >
        <FlexContainer>
          <SubdirectoryIcon />
          <KeyCanvas onClick={() => onClick()}>{type}</KeyCanvas>
          {label}
        </FlexContainer>
        <DownIcon rotate={open ? 180 : 0} />
      </Container>
      {open && (
        <FlexContainer>
          <Indentation />
          <ContainerColumn>
            {canvas &&
              Object.entries(vault.get(canvas)).map(([key, value]) => {
                if (typeof value === "string" || typeof value === "number") {
                  return (
                    <KeyValuePairString
                      key={key}
                      onClick={() => {
                        if (key === "height" || key === "width" || key === "duration") {
                          editorContext?.changeSelectedProperty("canvas", 3);
                        }
                      }}
                      propertyName={key}
                      value={value}
                    />
                  );
                } else if (Array.isArray(value)) {
                  return (
                    <KeyValuePairArray
                      key={key}
                      propertyName={key}
                      // @ts-ignore
                      array={vault.get(canvas)[key]}
                      onClick={() => {
                        if (key === "metadata") {
                          editorContext?.changeSelectedProperty("canvas", 1);
                        } else if (key === "behavior") {
                          editorContext?.changeSelectedProperty("canvas", 3);
                        }
                      }}
                    />
                  );
                } else {
                  return (
                    <KeyObjectPairing
                      key={key}
                      onClick={() => {
                        if (key === "summary" || "label" || "rights") {
                          editorContext?.changeSelectedProperty("canvas", 0);
                        }
                      }}
                      propertyName={key}
                      // @ts-ignore
                      object={vault.get(canvas)[key]}
                    />
                  );
                }
              })}
          </ContainerColumn>
        </FlexContainer>
      )}
    </>
  );
};

export const Canvases: React.FC<KeyObjectPairing> = ({ object, onClick }) => {
  return (
    <FlexContainer>
      <Indentation />
      <Expanded>
        <ErrorBoundary>
          <IIIFCanvas onClick={() => onClick()} id={object.id} type={object.type} />
        </ErrorBoundary>
      </Expanded>
    </FlexContainer>
  );
};
