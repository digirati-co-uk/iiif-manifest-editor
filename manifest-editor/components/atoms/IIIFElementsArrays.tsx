import { useState } from "react";
import { useAnnotationPage } from "../../hooks/useAnnotationPage";
import {
  Container,
  Expandable,
  Count,
  Expanded,
  KeyValuePairString,
  Key,
  Value,
  KeyAnnoPage,
  ContainerColumn
} from "./IIIFElementsShared";
import { KeyObjectPairing } from "./IIIFElementsObject";

import { DownIcon } from "../icons/DownIcon";

import { ErrorBoundary } from "./ErrorBoundary";
import { FlexContainer } from "../layout/FlexContainer";
import { getValue } from "@iiif/vault-helpers";

type KeyArrayPairing = {
  propertyName: string;
  array: Array<any>;
  onClick: () => void;
};

export const KeyValuePairArray: React.FC<KeyArrayPairing> = ({
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
      <Expanded>
        <ErrorBoundary>
          {open ? (
            array.map((val: any) => {
              if (typeof val === "string") {
                return <Value>{val}</Value>;
              } else {
                return Object.entries(val).map(([key, value]) => {
                  return (
                    <KeyValuePairString
                      key={key}
                      onClick={() => console.log("clicked", key)}
                      propertyName={key}
                      value={value}
                    />
                  );
                });
              }
            })
          ) : (
            <></>
          )}
        </ErrorBoundary>
      </Expanded>
    </>
  );
};

const Annotation: React.FC<{ type: string; id: string }> = ({ type, id }) => {
  const annotation = useAnnotationPage({ id: id });
  const label = getValue(annotation?.label);
  const [open, setOpen] = useState(false);
  console.log(annotation);
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
          {annotation && Object.entries(annotation).map(([key, value]) => {
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
            {array.map(annotation => {
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
