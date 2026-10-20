import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
addons.setConfig({
  layout: { navSize: 220, showPanel: false },
  theme: create({
    base: "light",
    brandTitle: "Manifest Editor",
    colorPrimary: "#B84C74",
    colorSecondary: "#892C4E",
    appBg: "#ffffff",
    appContentBg: "#ffffff",
  }),
});
