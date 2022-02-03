import styled from "styled-components";

export const ModalContainer = styled.div`
   {
    position: fixed;
    background: white;
    width: ${(props: any) => props.width || '33%' };
    height: auto;
    border-radius: 10px;
    padding: 0.75rem;
    color: rgba(0, 0, 139, 0.7);
    display: flex;
    top: ${(props: any) => props.top || '33%' };
    left: 33%;
    z-index: 12;
  }
`;
