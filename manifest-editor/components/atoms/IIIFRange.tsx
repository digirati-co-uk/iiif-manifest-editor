import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";

import {
  Container,
  Expandable,
  ContainerColumn,
  KeyValuePairString,
  Expanded,
  KeyRanges
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "./ErrorBoundary";
import { useRange } from "react-iiif-vault";
import { Subdirectory } from "../icons/Subdirectory";

const IIIFRange: React.FC<{ type: string; id: string }> = ({ type, id }) => {
  const range = useRange({ id: id });
  const label = getValue(range?.label);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Container>
        <Subdirectory />
        <KeyRanges>{type}</KeyRanges>
        {label}
        <Expandable onClick={() => setOpen(!open)}>
          <DownIcon rotate={open ? 180 : 0} />
        </Expandable>
      </Container>
      {open && (
        <ContainerColumn>
          {range &&
            Object.entries(range).map(([key, value]) => {
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

export const Ranges: React.FC<KeyObjectPairing> = ({ object }) => {
  return (
    <>
      <Expanded>
        <ErrorBoundary>
          <IIIFRange id={object.id} type={object.type} />
        </ErrorBoundary>
      </Expanded>
    </>
  );
};
