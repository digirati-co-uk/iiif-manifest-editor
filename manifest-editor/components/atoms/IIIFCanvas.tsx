import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";

import {
  Container,
  Expandable,
  ContainerColumn,
  KeyValuePairString,
  Expanded,
  KeyCanvas
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "./ErrorBoundary";
import { useCanvas, useSimpleViewer } from "react-iiif-vault";
import { Subdirectory } from "../icons/Subdirectory";

const IIIFCanvas: React.FC<{ type: string; id: string }> = ({
  type,
  id
}) => {
  const canvas = useCanvas({ id: id });
  const label = getValue(canvas?.label);
  const [open, setOpen] = useState(false);
  const { setCurrentCanvasId } = useSimpleViewer();


  return (
    <>
      <Container onClick={() => setCurrentCanvasId(id)}>
        <Subdirectory />
        <KeyCanvas>{type}</KeyCanvas>
        {label}
        <Expandable onClick={() => setOpen(!open)}>
          <DownIcon rotate={open ? 180 : 0} />
        </Expandable>
      </Container>
      {open && (
        <ContainerColumn>
          {canvas &&
            Object.entries(canvas).map(([key, value]) => {
              if (typeof value === "string") {
                return (
                  <KeyValuePairString
                    key={key}
                    onClick={() => console.log("clicked", key)}
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
                    onClick={() => {}}
                  />
                );
              } else {
                return (
                  <KeyObjectPairing
                    key={key}
                    onClick={() => {}}
                    propertyName={key}
                    object={value}
                  />
                );
              }
            })}
        </ContainerColumn>
      )}
    </>
  );
};

export const Canvases: React.FC<KeyObjectPairing> = ({ object }) => {
  return (
    <>
      <Expanded>
        <ErrorBoundary>
          <IIIFCanvas id={object.id} type={object.type} />
        </ErrorBoundary>
      </Expanded>
    </>
  );
};
