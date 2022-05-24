import styled from "styled-components";

export const Dropdown = styled.li`
   {
    display: inline-block;
  }
`;

export const DropdownContent = styled.div`
   {
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: ${(props: any) => props.theme.color.white || "white"};
    color: ${(props: any) => props.theme.color.black || " black"};
    font-size: 0.75rem;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 15;
    button {
      &:hover {
        background-color: ${(props: any) => props.theme.color.lightgrey || "lightgrey"};
      }
    }
  }
`;
