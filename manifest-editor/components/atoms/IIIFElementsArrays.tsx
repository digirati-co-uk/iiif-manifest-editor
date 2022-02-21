import { useState } from "react";
import {
  Container,
  ContainerColumn,
  Expandable,
  Count,
  Expanded,
  KeyValuePairString,
  Key,
  Value
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";

import { ErrorBoundary } from "./ErrorBoundary";

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
        <Key>{propertyName}</Key>
        <Expandable onClick={() => setOpen(!open)}>
          <Count title={`Count of ${propertyName}`}>{array.length}</Count>
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
