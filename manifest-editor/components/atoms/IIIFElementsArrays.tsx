import { useState } from "react";
import {
  Container,
  Expandable,
  Count,
  Expanded,
  KeyValuePairString,
  Key,
  Value,
} from "./IIIFElementsShared";

import { DownIcon } from "../icons/DownIcon";

import { ErrorBoundary } from "./ErrorBoundary";
import { FlexContainer } from "../layout/FlexContainer";

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
