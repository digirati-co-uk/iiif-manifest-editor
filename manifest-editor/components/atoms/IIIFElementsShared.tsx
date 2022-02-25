import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  padding: 1rem 0.75rem;
  width: 100%;
  border-bottom: 0.01px solid lightgrey;
  &:hover {
    background-color: #e8e8e8;
  }
`;

export const ContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify: space-between;
  padding: 1rem 0.75rem;
  border: none;
  width: 100%;
  &:hover {
    background-color: #e8e8e8;
  }
`;

export const Key = styled.div`
  padding: 0 1rem;
  white-space: nowrap;
  text-align: center;
  border-radius: 1rem;
  font-size: 0.75rem;
`;

export const KeyManifest = styled(Key)`
  background: rgba(0, 0, 0, 0.2);
`;

export const KeyCanvas = styled(Key)`
  background: rgba(255, 225, 170, 0.2);
`;
export const KeyAnnoPage = styled(Key)`
  background: rgba(247, 226, 173, 0.8);
`;

export const KeyContentResource = styled(Key)`
  background: rgba(207, 247, 255, 0.8);
`;

export const Expandable = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  max-width: 50%;
  text-align: left;
  font-size: 0.75rem;
`;

export const Count = styled.div`
  border-radius: 1rem;
  background: #347cff;
  color: rgba(255, 255, 255, 0.87);
  text-align: center;
  padding: 0 0.5rem;
  margin: 0rem 0.75rem;
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
