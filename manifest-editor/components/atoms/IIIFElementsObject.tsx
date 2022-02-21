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

  return (
    <Container onClick={() => onClick()}>
      <Key>{propertyName}</Key>
      {Object.keys(object).length > 0 ? (
        <>
          <Expandable onClick={() => setOpen(!open)}>
            <Count title={`Count of ${propertyName}`}>
              {Object.keys(object).length}
            </Count>
            {Object.keys(object).length > 0 && (
              <DownIcon rotate={open ? 180 : 0} />
            )}
          </Expandable>
          <Expanded>
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
          </Expanded>
        </>
      ) : (
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
    </Container>
  );
};
