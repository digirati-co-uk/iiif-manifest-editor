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
  border: 1px solid #c9cfd5;
  padding-left: 0.5em;
  padding-right: 1em;
  border-radius: 0 5px 5px 0;
  align-self: stretch;
  margin: 0;

  &:focus {
    outline: none;
    border: 1px solid ${(props: any) => props.theme.color.main || "main"};
  }
`;

export const SelectMenuContainer = styled.div`
  display: inline;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  height: 2rem;
`;
