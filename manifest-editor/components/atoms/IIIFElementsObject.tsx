import { useState } from "react";
import {
  Container,
  Key,
  KeyValuePairString,
  ContainerColumn,
  Expandable,
  Count,
  Expanded
} from "./IIIFElementsShared";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { DownIcon } from "../icons/DownIcon";
import { FlexContainer } from "../layout/FlexContainer";

type KeyObjectPairing = {
  propertyName: string;
  object: any;
  onClick: () => void;
};

export const KeyObjectPairing: React.FC<KeyObjectPairing> = ({
  propertyName,
  object,
  onClick
}) => {
  const [open, setOpen] = useState(false);
  console.log(object)
  if (!object || Object.keys(object).length === 0)
    return (
      <Container>
        <Key>{propertyName}</Key>
      </Container>
    );

  return (
    <>
      {Object.keys(object).length > 0 ? (
        <>
          <Container>
            <FlexContainer style={{ justifyContent: "space-between" }}>
              <Key>{propertyName}</Key>
              <Count title={`Count of ${propertyName}`}>
                {Object.keys(object).length}
              </Count>
            </FlexContainer>
            <Expandable onClick={() => setOpen(!open)}>
              {Object.keys(object).length > 0 && (
                <DownIcon rotate={open ? 180 : 0} />
              )}
            </Expandable>
          </Container>
          {open && (
            <ContainerColumn>
              {Object.entries(object).map(([key, value]) => {
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
      ) : (
        <>
          <Key>{propertyName}</Key>
          <ContainerColumn>
            {Object.entries(object).map(([key, value]) => {
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
        </>
      )}
    </>
  );
};
