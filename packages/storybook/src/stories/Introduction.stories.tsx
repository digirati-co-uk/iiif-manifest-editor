import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryFrame } from "../support/StoryFrame";

const meta = { title: "Introduction", parameters: { controls: { disable: true } } } satisfies Meta;
export default meta;
export const Workbench: StoryObj = {
  render: () => (
    <StoryFrame
      title="Manifest Editor workbench"
      summary="Explore the building blocks, then compose a complete editor."
    >
      <div className="sb-pane">
        <p>
          Choose a section in the sidebar. Components need no IIIF context; Components with context use the real
          headless shell.
        </p>
        <p>
          Creators let you fill in a real form and inspect the resulting IIIF JSON. Editors show a live resource
          alongside its editing panel. Presets compose the complete editor.
        </p>
        <p>
          Examples load remote resources from the{" "}
          <a className="sb-link" href="https://iiif.io/api/cookbook/">
            IIIF Cookbook
          </a>{" "}
          and{" "}
          <a className="sb-link" href="https://heritage.tudelft.nl/iiif/collection.json">
            TU Delft Academic Heritage
          </a>
          . Each story has its own in-memory data. Use Reset to discard changes.
        </p>
        <p>
          Use Storybook’s Controls panel to explore available configurations. Remote content requires a network
          connection; errors include a retry action.
        </p>
      </div>
    </StoryFrame>
  ),
};
