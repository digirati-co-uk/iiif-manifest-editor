import styled from "styled-components";

export const ContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: none;
  width: 100%;
  cursor: pointer;
  &:hover {
    background-color: ${(props: any) =>
      props.theme.color.lightgrey || "lightgrey"};
  }
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  width: 100%;
  cursor: pointer;
  border-bottom: 1px solid
    ${(props: any) => props.theme.color.mediumgrey || "grey"};
  &:hover {
    background-color: ${(props: any) =>
      props.theme.color.lightgrey || "lightgrey"};
    ${ContainerColumn} {
      background: ${(props: any) => props.theme.color.lightgrey || "lightgrey"};
    }
  }
`;

export const Indentation = styled.div`
  width: 1rem;
  height: 1rem;
`;

export const Key = styled.div`
  padding: ${(props: any) => props.theme.padding.xs || "0.25rem"}
    ${(props: any) => props.theme.padding.small || "0.5rem"};
  white-space: nowrap;
  text-align: center;
  border-radius: 1rem;
  font-size: 0.75rem;
`;

export const KeyManifest = styled(Key)`
  background: ${(props: any) =>
    props.theme.iiifColor.manifest || "rgba(0, 0, 0, 0.2)"};
`;

export const KeyCanvas = styled(Key)`
  background: ${(props: any) =>
    props.theme.iiifColor.canvas || "rgba(255, 222, 219, 0.8)"};
`;

export const KeyService = styled(Key)`
  background: ${(props: any) =>
    props.theme.iiifColor.service || "rgba(13, 110, 253, 0.8)"};
`;
export const KeyAnnoPage = styled(Key)`
  background: ${(props: any) =>
    props.theme.iiifColor.annotation || "rgba(247, 226, 173, 0.8)"};
`;

export const KeyContentResource = styled(Key)`
  background: ${(props: any) =>
    props.theme.iiifColor.contentResource || "rgba(207, 247, 255, 0.8)"};
`;

export const KeyRanges = styled(Key)`
  background: ${(props: any) =>
    props.theme.iiifColor.ranges || "rgba(144, 213, 157, 0.8)"};
`;

export const Expanded = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 0 0 ${(props: any) => props.theme.padding.small || "0.5rem"};
  background-color: ${(props: any) =>
    props.theme.color.lightgrey || "lightgrey"};
  .parent:hover .child {
    background-color: ${(props: any) =>
      props.theme.color.lightgrey || "lightgrey"};
    border-bottom: 1px solid
      ${(props: any) => props.theme.color.white || "white"};
  }
`;

export const Value = styled.div`
  padding: 0 ${(props: any) => props.theme.padding.small || "0.5rem"};
  overflow-x: hidden;
  word-break: break-all;
  text-align: left;
  font-size: 0.75rem;
`;

export const ValueSolo = styled.div`
  padding: 0 0 0 ${(props: any) => props.theme.padding.large || "3rem"};
  text-align: left;
  font-size: 0.75rem;
`;

export const Count = styled.div`
  border-radius: 1rem;
  background: ${(props: any) => props.theme.color.main || "main"};
  color: rgba(255, 255, 255, 0.87);
  text-align: center;
  font-size: 0.75rem;
  padding: 0 ${(props: any) => props.theme.padding.small || "0.25rem"};
`;

type KeyString = {
  propertyName: string;
  value: any;
  onClick: () => void;
};

export const KeyValuePairString: React.FC<KeyString> = ({
  propertyName,
  value,
  onClick,
}) => {
  return (
    <Container onClick={onClick}>
      <Key>{propertyName}</Key>
      <Value>{value}</Value>
    </Container>
  );
};
