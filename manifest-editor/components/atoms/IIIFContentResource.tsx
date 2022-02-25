import { useContentResource } from "../../hooks/useContentResource";
import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";

import {
  Container,
  KeyContentResource,
  Expandable,
  ContainerColumn,
  KeyValuePairString,
  Expanded
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "./ErrorBoundary";

const ContentResource: React.FC<{ type: string; id: string }> = ({
  type,
  id
}) => {
  const content = useContentResource({ id: id });
  const label = getValue(content?.label);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Container>
        <KeyContentResource>{type}</KeyContentResource>
        {label}
        <Expandable onClick={() => setOpen(!open)}>
          <DownIcon rotate={open ? 180 : 0} />
        </Expandable>
      </Container>
      {open && (
        <ContainerColumn>
          {content &&
            Object.entries(content).map(([key, value]) => {
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

export const ContentResources: React.FC<KeyObjectPairing> = ({ object }) => {
  return (
    <>
      <Expanded>
        <ErrorBoundary>
          <ContentResource id={object.id} type={object.type} />
        </ErrorBoundary>
      </Expanded>
    </>
  );
};
