import styled from "styled-components";

export const Button = styled.button`
   {
    padding: 0 ${(props: any) => props.theme.padding.small || "0.5rem"};
    color: ${(props: any) => props.theme.color.main || "none"};
    background-color: ${(props: any) => props.theme.color.white || "white"};
    border-radius: inherit;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 2rem;
  }
`;

export const SecondaryButton = styled.button`
   {
    padding: 0 ${(props: any) => props.theme.padding.medium || "1rem"};
    color: ${(props: any) => props.theme.color.main || "#347cff;"};
    background-color: ${(props: any) => props.theme.color.white || "white"};
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    height: 2rem;
    display: flex;
    align-items: center;
  }
`;

export const CalltoButton = styled.button`
   {
    padding: 0 ${(props: any) => props.theme.padding.medium || "1rem"};
    color: ${(props: any) => props.theme.color.white || "white"};
    background-color: ${(props: any) => props.theme.color.main || "#347cff;"};
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    height: 2rem;
    display: flex;
    align-items: center;
  }
`;
