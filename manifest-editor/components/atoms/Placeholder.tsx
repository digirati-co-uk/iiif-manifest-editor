import styled from "styled-components";

export const Placeholder = styled.div`
   {
    padding: 0.5em;
    color: ${(props: any) => props.color || "black"};
  }
`;
