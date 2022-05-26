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
    :disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }
`;

export const SmallButton = styled(Button)`
  padding: 0 ${(props: any) => props.theme.padding.xs || "0.25rem"};
  height: unset;
  background: none;
`;

export const SecondaryButton = styled(Button)`
   {
    padding: 0 ${(props: any) => props.theme.padding.medium || "1rem"};
    color: ${(props: any) => props.theme.color.main || "#347cff;"};
    background-color: ${(props: any) => props.theme.color.white || "white"};
    border: 1px solid ${(props: any) => props.theme.color.main || "#347cff;"};
    border-radius: 0.25rem;
    cursor: pointer;
    height: 2rem;
    display: flex;
    align-items: center;
    white-space: nowrap;
    font-size: 0.75rem;

    :disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }
`;

export const CalltoButton = styled(Button)`
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

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  width: fit-content;
  flex-wrap: wrap;
  align-content: flex-start;
`;
