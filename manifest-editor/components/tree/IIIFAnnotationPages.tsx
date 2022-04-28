import { useAnnotationPage } from "../../hooks/useAnnotationPage";
import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";

import {
  Container,
  KeyAnnoPage,
  ContainerColumn,
  KeyValuePairString,
  Count,
  Key,
  Indentation,
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";
import { KeyValuePairArray, KeyArrayPairing } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { FlexContainer } from "../layout/FlexContainer";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { SubdirectoryIcon } from "../icons/SubdirectoryIcon";

const Annotation: React.FC<{ type: string; id: string }> = ({ type, id }) => {
  const annotation = useAnnotationPage({ id: id });
  const label = getValue(annotation?.label);
  const [open, setOpen] = useState(false);
  return (
    <ContainerColumn>
      <Container onClick={() => setOpen(!open)}>
        <FlexContainer>
          <SubdirectoryIcon />
          <KeyAnnoPage>{type}</KeyAnnoPage>
          {label}
        </FlexContainer>
        <DownIcon rotate={open ? 180 : 0} />
      </Container>
      {open && (
        <FlexContainer>
          <Indentation />
          <ContainerColumn>
            {annotation &&
              Object.entries(annotation).map(([key, value]) => {
                if (typeof value === "string" || typeof value === "number") {
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
        </FlexContainer>
      )}
    </ContainerColumn>
  );
};

export const Annotations: React.FC<KeyArrayPairing> = ({
  propertyName,
  array,
  onClick,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Container
        onClick={() => {
          onClick();
          setOpen(!open);
        }}
      >
        <FlexContainer>
          <Key>{propertyName}</Key>
          <Count title={`Count of ${propertyName}`}>{array.length}</Count>
        </FlexContainer>
        {array.length > 0 && <DownIcon rotate={open ? 180 : 0} />}
      </Container>
      {open && (
        <ErrorBoundary>
          {array.map((annotation: any) => {
            return (
              <FlexContainer>
                <Indentation />
                <Annotation id={annotation.id} type={annotation.type} />
              </FlexContainer>
            );
          })}
        </ErrorBoundary>
      )}
    </>
  );
};
