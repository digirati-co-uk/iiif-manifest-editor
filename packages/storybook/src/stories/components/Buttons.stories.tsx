import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionButton, AddIcon, ControlButton, IconButton, ResetIcon } from "@manifest-editor/components";
import { useState } from "react";
import { StoryFrame } from "../../support/StoryFrame";

function Buttons({ large = false }: { large?: boolean }) {
  const [action, setAction] = useState("No action yet");
  return (
    <StoryFrame
      title="Buttons"
      summary="The editor's action, control and icon buttons, without IIIF providers."
      onReset={() => setAction("No action yet")}
    >
      <div className="sb-pane" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <ActionButton primary large={large} onPress={() => setAction("Primary action pressed")}>
          Create resource
        </ActionButton>
        <ActionButton large={large} onPress={() => setAction("Secondary action pressed")}>
          Cancel
        </ActionButton>
        <ActionButton primary large={large} isDisabled>
          Unavailable
        </ActionButton>
        <ControlButton onClick={() => setAction("Control action pressed")}>Add property</ControlButton>
        <IconButton label="Add resource" onPress={() => setAction("Add icon pressed")}>
          <AddIcon />
        </IconButton>
        <IconButton label="Reset action" onPress={() => setAction("No action yet")}>
          <ResetIcon />
        </IconButton>
      </div>
      <output style={{ display: "block" }}>{action}</output>
    </StoryFrame>
  );
}

const meta = { title: "Components/Buttons", component: Buttons, args: { large: false } } satisfies Meta<typeof Buttons>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Actions: Story = {};
