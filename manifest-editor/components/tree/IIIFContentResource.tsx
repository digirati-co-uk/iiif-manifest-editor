import { useContentResource } from "../../hooks/useContentResource";
import { getValue } from "@iiif/vault-helpers";
import { useState } from "react";

import {
  Container,
  KeyContentResource,
  ContainerColumn,
  KeyValuePairString,
  Expanded,
  Indentation,
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { SubdirectoryIcon } from "../icons/SubdirectoryIcon";
import { FlexContainer } from "../layout/FlexContainer";

const ContentResource: React.FC<{ type: string; id: string }> = ({
  type,
  id,
}) => {
  const content = useContentResource({ id: id });
  // @ts-ignore
  const label = getValue(content?.label);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Container onClick={() => setOpen(!open)}>
        <FlexContainer>
          <SubdirectoryIcon />
          <KeyContentResource>{type}</KeyContentResource>
          {label}
        </FlexContainer>
        <DownIcon rotate={open ? 180 : 0} />
      </Container>
      {open && (
        <FlexContainer>
          <Indentation />
          <ContainerColumn>
            {content &&
              Object.entries(content).map(([key, value]) => {
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
    </>
  );
};

export const ContentResources: React.FC<KeyObjectPairing> = ({ object }) => {
  return (
    <FlexContainer>
      <Indentation />
      <Expanded>
        <ErrorBoundary>
          <ContentResource id={object.id} type={object.type} />
        </ErrorBoundary>
      </Expanded>
    </FlexContainer>
  );
};
