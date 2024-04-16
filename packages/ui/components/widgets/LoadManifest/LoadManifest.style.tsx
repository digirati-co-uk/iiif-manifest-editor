import styled from "styled-components";

export const LoadManifestWidget = styled.form`
  display: flex;
  width: 100%;
  justify-content: space-between;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    flex-wrap: wrap;
  }
`;
