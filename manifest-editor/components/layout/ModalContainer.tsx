import styled from "styled-components";

export const ModalContainer = styled.div`
   {
    display: flex;
    flex-direction: column;
    z-index: 13;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    min-height: 360px;
    box-shadow: ${(props: any) => props.theme.shadows.standard || ""};
    padding: ${(props: any) => props.theme.padding.large || "1rem"};
    background: ${(props: any) => props.theme.color.white || "white"};
    @media (max-width: ${(props: any) =>
      props.theme.device.tablet || "770px"}) {
      height: 100vh;
      width: 100vw;
      z-index: 16;
      justify-content: space-between;
  }
`;
