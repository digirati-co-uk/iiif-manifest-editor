import { getValue } from "@iiif/helpers";
import { useState } from "react";

import {
  Container,
  ContainerColumn,
  KeyValuePairString,
  Expanded,
  KeyService,
  Indentation,
} from "./IIIFElementsShared";

import { DownIcon } from "../../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { FlexContainer } from "../../components/layout/FlexContainer";

const Service: React.FC<KeyObjectPairing> = ({ object }) => {
  const label = getValue(object?.label);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Container onClick={() => setOpen(!open)}>
        <FlexContainer>
          <KeyService>{object?.type}</KeyService>
          {label}
        </FlexContainer>
        <DownIcon rotate={open ? 180 : 0} />
      </Container>
      {open && (
        <ContainerColumn>
          {object &&
            Object.entries(object).map(([key, value]) => {
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
                return <KeyValuePairArray key={key} propertyName={key} array={value} onClick={() => {}} />;
              } else {
                return <KeyObjectPairing key={key} onClick={() => {}} propertyName={key} object={value} />;
              }
            })}
        </ContainerColumn>
      )}
    </>
  );
};

export const Services: React.FC<KeyObjectPairing> = ({ object }) => {
  return (
    <FlexContainer>
      <Indentation />
      <Expanded>
        <ErrorBoundary>
          <Service propertyName={""} object={object} onClick={() => {}} />
        </ErrorBoundary>
      </Expanded>
    </FlexContainer>
  );
};
