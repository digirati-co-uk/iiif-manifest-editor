import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  /* Disable double-click to zoom on links, input fields
   and buttons to improve responsiveness */
  a, input, button
  {
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

`;
