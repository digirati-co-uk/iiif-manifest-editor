import styled from "styled-components";

export const Button = styled.button`
   {
    padding: 0.12em;
    margin: 0.12em;
    color: ${(props: any) => props.color || "none"};
    background-color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
`;

export const SecondaryButton = styled.button`
   {
    padding: 0.12em;
    margin: 0.12em;
    color: ${(props: any) => props.color || "#347cff;"};
    background-color: white;
    border: none;
    cursor: pointer;
    display: flex;
    justify-items: center;
  }
`;

export const CalltoButton = styled.button`
   {
    padding: 1em;
    margin: 0.12em;
    color: white;
    background-color: #347cff;
    border: none;
    cursor: pointer;
  }
`;
