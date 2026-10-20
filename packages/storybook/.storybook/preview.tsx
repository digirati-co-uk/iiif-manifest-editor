import type { Preview } from "@storybook/react-vite";
import "manifest-editor/reset.css";
import "manifest-editor/index.css";
import "../src/support/workbench.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="manifest-editor sb-preview">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    options: {
      storySort: { order: ["Introduction", "Components", "Components with context", "Creators", "Editors", "Presets"] },
    },
  },
};
export default preview;
