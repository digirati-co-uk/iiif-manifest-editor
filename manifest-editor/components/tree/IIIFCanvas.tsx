import { getValue } from "@iiif/vault-helpers";
import { useContext, useState } from "react";

import {
  Container,
  ContainerColumn,
  KeyValuePairString,
  Expanded,
  KeyCanvas,
  Indentation,
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { useCanvas } from "react-iiif-vault";
import { Subdirectory } from "../icons/Subdirectory";
import { FlexContainer } from "../layout/FlexContainer";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
import ShellContext from "../apps/Shell/ShellContext";

const IIIFCanvas: React.FC<{ type: string; id: string; onClick: () => void }> =
  ({ type, id, onClick }) => {
    const canvas = useCanvas({ id: id });
    const label = getValue(canvas?.label);
    const [open, setOpen] = useState(false);
    const shellContext = useContext(ShellContext);
    const editorContext = useContext(ManifestEditorContext);

    return (
      <>
        <Container
          onClick={() => {
            shellContext?.setCurrentCanvasId(id);
            setOpen(!open);
          }}
        >
          <FlexContainer>
            <Subdirectory />
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
                Object.entries(canvas).map(([key, value]) => {
                  if (typeof value === "string" || typeof value === "number") {
                    return (
                      <KeyValuePairString
                        key={key}
                        onClick={() => {
                          if (
                            key === "height" ||
                            key === "width" ||
                            key === "duration"
                          ) {
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
                        array={value}
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
                        object={value}
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
          <IIIFCanvas
            onClick={() => onClick()}
            id={object.id}
            type={object.type}
          />
        </ErrorBoundary>
      </Expanded>
    </FlexContainer>
  );
};
