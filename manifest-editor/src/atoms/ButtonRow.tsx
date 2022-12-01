import styled from "styled-components";

export const ButtonRow = styled.div`
  background: #f9f9f9;
  padding: 0.3em;

  button,
  a {
    //

    & ~ & {
      margin-left: 0.3em;
    }
  }
`;
