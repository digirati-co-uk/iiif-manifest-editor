import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";

import { Container, ContainerColumn, KeyValuePairString, Expanded, KeyRanges, Indentation } from "./IIIFElementsShared";

import { DownIcon } from "../../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { useRange } from "react-iiif-vault";
import { SubdirectoryIcon } from "../../icons/SubdirectoryIcon";
import { FlexContainer } from "../../components/layout/FlexContainer";

const IIIFRange: React.FC<{ type: string; id: string }> = ({ type, id }) => {
  const range = useRange({ id: id });
  const label = getValue(range?.label);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Container onClick={() => setOpen(!open)}>
        <FlexContainer>
          <SubdirectoryIcon />
          <KeyRanges>{type}</KeyRanges>
          {label}
        </FlexContainer>
        <DownIcon rotate={open ? 180 : 0} />
      </Container>
      {open && (
        <FlexContainer>
          <Indentation />
          <ContainerColumn>
            {range &&
              Object.entries(range).map(([key, value]) => {
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
        </FlexContainer>
      )}
    </>
  );
};

export const Ranges: React.FC<KeyObjectPairing> = ({ object }) => {
  return (
    <FlexContainer>
      <Indentation />
      <Expanded>
        <ErrorBoundary>
          <IIIFRange id={object.id} type={object.type} />
        </ErrorBoundary>
      </Expanded>
    </FlexContainer>
  );
};
