import styled from "styled-components";

export const DropdownItem = styled.option`
   {
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
    border: none;
    cursor: pointer;
    background-color: ${(props: any) => props.theme.color.white || "white"};
    border-radius: 0.25rem;
    &:hover {
      background-color: ${(props: any) => props.theme.color.lightgrey || "lightgrey"};
    }
  }
`;

export const StyledSelect = styled.select`
  background-color: ${(props: any) => props.theme.color.white || "white"};
  display: flex;
  align-items: center;
  height: 2rem;
  border: 0.06rem solid ${(props: any) => props.theme.color.grey || "grey"};
  border-radius: 0 0.25rem 0.25rem 0;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"} 0;
`;

export const SelectMenuContainer = styled.div`
  display: inline;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  height: 2rem;
`;
