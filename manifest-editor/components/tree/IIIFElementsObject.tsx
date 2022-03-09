import { useState } from "react";
import {
  Container,
  Key,
  KeyValuePairString,
  ContainerColumn,
  Count,
  Indentation,
} from "./IIIFElementsShared";
import { KeyValuePairArray } from "./IIIFElementsArrays";
import { DownIcon } from "../icons/DownIcon";
import { FlexContainer } from "../layout/FlexContainer";

export type KeyObjectPairing = {
  propertyName: string;
  object: any;
  onClick: () => void;
};

export const KeyObjectPairing: React.FC<KeyObjectPairing> = ({
  propertyName,
  object,
  onClick,
}) => {
  const [open, setOpen] = useState(false);
  if (!object || Object.keys(object).length === 0)
    return (
      <Container onClick={() => setOpen(!open)}>
        <Key>{propertyName}</Key>
      </Container>
    );

  return (
    <ContainerColumn
      onClick={() => {
        onClick();
      }}
    >
      {Object.keys(object).length > 0 ? (
        <>
          <Container onClick={() => setOpen(!open)}>
            <FlexContainer style={{ justifyContent: "space-between" }}>
              <Key>{propertyName}</Key>
              <Count title={`Count of ${propertyName}`}>
                {Object.keys(object).length}
              </Count>
            </FlexContainer>
            {Object.keys(object).length > 0 && (
              <DownIcon rotate={open ? 180 : 0} />
            )}
          </Container>
          {open && (
            <FlexContainer>
              <Indentation />
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
                        onClick={() => console.log("clicked this")}
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
      ) : (
        <>
          <Key>{propertyName}</Key>
          <FlexContainer>
            <Indentation />
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
          </FlexContainer>
        </>
      )}
    </ContainerColumn>
  );
};
