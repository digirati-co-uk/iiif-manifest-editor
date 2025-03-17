import { HandleContainer as HandleContainer_ } from "@manifest-editor/components";

import styled from "styled-components";

export const HandleContainer = HandleContainer_;

export const HandleContainer2 = styled.div`
  font-size: 1.2em;
  display: flex;
  padding: 0.1em;
  border-radius: 3px;
  margin: auto 0.2em;
  aspect-ratio: 1;

  &:hover,
  &[aria-expanded="true"] {
    background: #e8f0fe;
  }
`;
