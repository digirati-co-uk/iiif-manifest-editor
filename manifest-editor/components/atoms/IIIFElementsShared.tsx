import styled from "styled-components";
import { useState } from "react";
import { DownIcon } from "../icons/DownIcon";
import { ErrorBoundary } from "./ErrorBoundary";
import { KeyValuePairArray } from "./IIIFElementsArrays";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  padding: 1em;
  background-color: white;
  width: 100%;
  &:hover {
    background-color: #e8e8e8;
  }
`;

export const Key = styled.div`
  color: #696969;
  padding: 0 0.5em 0 0;
  width: 9em;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
  font-size: 0.75rem;
  &:hover {
    overflow: unset;
    white-space: normal;
  }
`;

export const Expandable = styled.div`
  display: flex;
  align-items: flex-end;
  right: 0;
  width: 100%
  cursor: pointer;
`;

export const Expanded = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 0 0 3rem;
  background-color: #e8e8e8
  &:hover {
    background-color: white;
  }
`;

export const Value = styled.div`
  padding: 0 0.5em 0 0;
  width: fit-content;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
  font-size: 0.75rem;
  &:hover {
    overflow: unset;
    white-space: normal;
  }
`;

export const Count = styled.div`
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: rgba(200, 54, 54, 0.2);
  color: black;
  text-align: center;
  padding: 10px 0;
`;

type KeyString = {
  propertyName: string;
  value: string | undefined | unknown;
  onClick: () => void;
};

export const KeyValuePairString: React.FC<KeyString> = ({
  propertyName,
  value,
  onClick
}) => {
  return (
    <Container onClick={onClick}>
      <Key>{propertyName}</Key>
      <Value>{value}</Value>
    </Container>
  );
};

type KeyObjectPairing = {
  propertyName: string;
  object: any;
};

export const KeyObjectPairing: React.FC<KeyObjectPairing> = ({
  propertyName,
  object
}) => {
  return (
    <Container>
      <Key>{propertyName}</Key>
      {Object.entries(object).map(([key, value]) => {
        console.log(value);
        if (typeof value === "string") {
          return (
            <KeyValuePairString
              onClick={() => console.log("clicked", key)}
              propertyName={key}
              value={value}
            />
          );
        } else if (Array.isArray(value)) {
          return <KeyValuePairArray propertyName={key} array={value}  onClick={() => {}}/>;
        } else {
          return <KeyObjectPairing propertyName={key} object={value}/>
        }

      })}
    </Container>
  );
};
