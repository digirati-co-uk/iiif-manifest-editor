import styled from "styled-components";

export const ButtonRow = styled.div`
  padding: 0.3em;

  display: flex;
  background: #e4e7ef;
  border-radius: 3px;
  margin: 0.3em 0;
  gap: 0.3em;

  button,
  a {
    //

    & ~ & {
      margin-left: 0.3em;
    }
  }

  &[data-sticky="true"] {
    position: sticky;
    bottom: 0;
  }
`;
