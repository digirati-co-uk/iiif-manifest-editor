import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    --atlas-background: #E5E7F0;
  }

  * {
    box-sizing: border-box;
  }

  /* Disable double-click to zoom on links, input fields
   and buttons to improve responsiveness */
  a, input, button {
    touch-action: manipulation;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  *[data-textual-content] {
    padding: 2em;
    font-size: 1.4em;
  }

  .me-logo {
    .me-logo-1,
    .me-logo-2,
    .me-logo-3 {
      transition: fill 3s ease-in-out;
    }
  }

  .me-logo:hover {
    .me-logo-1 {
      fill: #2359B2;
    }

    .me-logo-2 {
      fill: #F0CF35;
    }

    .me-logo-3 {
      fill: #c2a622;
    }
  }

`;
