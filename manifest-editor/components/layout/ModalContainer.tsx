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
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
    padding: 2rem;
    background: white;
  }
`;
