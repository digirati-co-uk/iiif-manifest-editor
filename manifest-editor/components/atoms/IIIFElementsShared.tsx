import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  padding: 1em 0;
  width: 100%;
  border-bottom: 0.01px solid lightgrey;
  &:hover {
    background-color: #e8e8e8;
  }
`;

export const ContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  padding: 1em;
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
  align-items: center;
  right: 0;
  width: 100%
  cursor: pointer;
`;

export const Expanded = styled.div`
  position: inline-block;
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
  max-width: 50%;
  text-align: left;
  font-size: 0.75rem;
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
  value: any;
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
