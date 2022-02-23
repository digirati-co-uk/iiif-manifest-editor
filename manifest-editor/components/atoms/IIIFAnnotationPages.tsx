import { useAnnotationPage } from "../../hooks/useAnnotationPage";
import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";

import {
  Container,
  KeyAnnoPage,
  Expandable,
  ContainerColumn,
  KeyValuePairString,
  Count,
  Expanded,
  Key
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";
import { KeyValuePairArray, KeyArrayPairing } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { FlexContainer } from "../layout/FlexContainer";
import { ErrorBoundary } from "./ErrorBoundary";

const Annotation: React.FC<{ type: string; id: string }> = ({ type, id }) => {
  const annotation = useAnnotationPage({ id: id });
  const label = getValue(annotation?.label);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Container>
        <KeyAnnoPage>{type}</KeyAnnoPage>
        {label}
        <Expandable onClick={() => setOpen(!open)}>
          <DownIcon rotate={open ? 180 : 0} />
        </Expandable>
      </Container>
      {open && (
        <ContainerColumn>
          {annotation &&
            Object.entries(annotation).map(([key, value]) => {
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

export const Annotations: React.FC<KeyArrayPairing> = ({
  propertyName,
  array,
  onClick
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Container onClick={() => onClick()}>
        <FlexContainer>
          <Key>{propertyName}</Key>
          <Count title={`Count of ${propertyName}`}>{array.length}</Count>
        </FlexContainer>
        <Expandable onClick={() => setOpen(!open)}>
          {array.length > 0 && <DownIcon rotate={open ? 180 : 0} />}
        </Expandable>
      </Container>
      {open && (
        <Expanded>
          <ErrorBoundary>
            {array.map((annotation: any) => {
              return (
                <>
                  <Annotation id={annotation.id} type={annotation.type} />
                </>
              );
            })}
          </ErrorBoundary>
        </Expanded>
      )}
    </>
  );
};
