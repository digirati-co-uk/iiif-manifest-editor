import { addDecorator } from "@storybook/react";
import { withThemesProvider } from "storybook-addon-styled-component-theme";
import { ThemeProvider } from "styled-components";

import { defaultTheme } from "../src/themes/default-theme";
import { ShellProvider } from "../src/context/ShellContext/ShellContext";
import { createElement } from "react";
import { GlobalStyle } from "../src/atoms/GlobalStyle";

const themes = [defaultTheme];

// @ts-ignore
addDecorator(withThemesProvider(themes, ThemeProvider));

addDecorator((story) => {
  return createElement(ShellProvider, {}, createElement(GlobalStyle), story());
})

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
