module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "aria-live-storybook-addon",
    "@storybook/addon-a11y"
  ],
  framework: "@storybook/react",
  core: {
    builder: "webpack5"
  }
};
