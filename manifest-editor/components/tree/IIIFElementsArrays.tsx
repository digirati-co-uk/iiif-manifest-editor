import { useState } from "react";
import {
  Container,
  Expandable,
  Count,
  KeyValuePairString,
  Key,
  Value,
  ContainerColumn
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";

import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { FlexContainer } from "../layout/FlexContainer";
import { KeyObjectPairing } from "./IIIFElementsObject";
import { ContentResources } from "./IIIFContentResource";
import { Canvases } from "./IIIFCanvas";
import { Ranges } from "./IIIFRange";
import { Services } from "./IIIFServices";
import { IIIFService } from "./IIIFService";

export type KeyArrayPairing = {
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
    <ContainerColumn>
      <Container onClick={() => onClick()}>
        <FlexContainer>
          <Key>{propertyName}</Key>
          <Count title={`Count of ${propertyName}`}>{array.length}</Count>
        </FlexContainer>
        <Expandable onClick={() => setOpen(!open)}>
          {array.length > 0 && <DownIcon rotate={open ? 180 : 0} />}
        </Expandable>
      </Container>
      <>
        <ErrorBoundary>
          {open ? (
            array.map((val: any) => {
              if (val && val.type === "ContentResource") {
                return (
                  <ContentResources
                    propertyName="ContentResource"
                    object={val}
                    onClick={() => {}}
                  />
                );
              } else if (val && val.type === "Canvas") {
                return (
                  <Canvases
                    propertyName="ContentResource"
                    object={val}
                    onClick={() => {}}
                  />
                );
              } else if (propertyName === "services") {
                return (
                  <Services
                    propertyName="Services"
                    object={val}
                    onClick={() => {}}
                  />
                );
              } else if (propertyName === "service") {
                return (
                  <IIIFService
                    propertyName="Services"
                    object={val}
                    onClick={() => {}}
                  />
                );
              } else if (val && val.type === "Range") {
                return (
                  <Ranges
                    propertyName="Range"
                    object={val}
                    onClick={() => {}}
                  />
                );
              } else if (typeof val === "string") {
                return <Value>{val}</Value>;
              } else {
                return Object.entries(val).map(([key, value]) => {
                  if (typeof value === "string") {
                    return (
                      <KeyValuePairString
                        key={key}
                        onClick={() => console.log("clicked", key)}
                        propertyName={key}
                        value={value}
                      />
                    );
                  } else {
                    return (
                      <KeyObjectPairing
                        object={value}
                        propertyName={key}
                        onClick={() => {}}
                      />
                    );
                  }
                });
              }
            })
          ) : (
            <></>
          )}
        </ErrorBoundary>
      </>
    </ContainerColumn>
  );
};
