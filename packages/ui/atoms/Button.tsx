import styled from "styled-components";

export const ButtonReset = styled.button`
  border: none;
  outline: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  font-size: inherit;
  color: inherit;
  cursor: pointer;
  &:hover {
    color: inherit;
  }
`;

export const Button = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  color: ${(props: any) => props.theme.color.main || "none"};
  background-color: ${(props: any) => props.theme.color.white || "white"};
  border-radius: inherit;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.85em;
  :disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:hover {
    background: #eee;
  }
`;

export const SmallButton = styled(Button as any)`
  padding: 0.25em ${(props: any) => props.theme.padding.xs || "0.4em"};
  height: unset;
  background: none;
`;

export const SecondaryButton = styled(Button as any)`
   {
    padding: 0 ${(props: any) => props.theme.padding.medium || "1rem"};
    color: ${(props: any) => props.theme.color.main || "#B84C74;"};
    background-color: ${(props: any) => props.theme.color.white || "white"};
    border: 1px solid ${(props: any) => props.theme.color.main || "#B84C74;"};
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

export const CalltoButton = styled(Button as any)`
  padding: 0 ${(props: any) => props.theme.padding.medium || "1rem"};
  color: ${(props: any) => props.theme.color.white || "white"};
  background-color: ${(props: any) => props.theme.color.main || "#B84C74;"};
  border: 1px solid #eee;
  border-radius: 0.25rem;
  cursor: pointer;
  justify-content: center;
  display: flex;
  align-items: center;
  &:hover {
    background-color: ${(props: any) => props.theme.color.mainHover || "#B84C74;"};
  }
`;

export const ButtonGroup = styled.div<{ $right?: boolean }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: ${(props) => (props.$right ? "flex-end" : "flex-start")};
`;
