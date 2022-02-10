import styled from "styled-components";

export const ModalContainer = styled.div`
   {
    position: fixed;
    background: white;
    width: ${(props: any) => props.width || '33%' };
    height: auto;
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    top: ${(props: any) => props.top || '33%' };
    left: 33%;
    z-index: 12;
  }
`;
