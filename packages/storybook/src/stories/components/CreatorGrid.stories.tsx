import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AudioIcon,
  CreatorGrid,
  EmptyCanvasIcon,
  HTMLIcon,
  ScaledImageIcon,
  TextIcon,
} from "@manifest-editor/components";
import { useState } from "react";
import { StoryFrame } from "../../support/StoryFrame";

function BuildingBlocks() {
  const [selected, setSelected] = useState<string>();
  const [version, setVersion] = useState(0);
  const blocks = [
    { id: "text", title: "Plain text", description: "A textual annotation body", icon: <TextIcon /> },
    { id: "image", title: "Image", description: "A remotely hosted image", icon: <ScaledImageIcon /> },
    { id: "html", title: "HTML", description: "Rich textual content", icon: <HTMLIcon /> },
    { id: "audio", title: "Audio", description: "A sound recording", icon: <AudioIcon /> },
    { id: "canvas", title: "Empty canvas", description: "A new presentation surface", icon: <EmptyCanvasIcon /> },
  ];
  return (
    <StoryFrame
      title="Creator building blocks"
      summary="The real creator selection grid. Activate a card with the mouse or keyboard to choose a building block."
      onReset={() => {
        setSelected(undefined);
        setVersion((v) => v + 1);
      }}
    >
      <div className="sb-pane">
        <CreatorGrid
          key={version}
          label="Choose a building block"
          items={blocks.map((block) => ({ ...block, onClick: () => setSelected(block.title) }))}
        />
      </div>
      <output style={{ display: "block" }}>{selected ? `Selected: ${selected}` : "Choose a building block."}</output>
    </StoryFrame>
  );
}

const meta = { title: "Components/Creator grid", component: BuildingBlocks } satisfies Meta<typeof BuildingBlocks>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BuildingBlockSelection: Story = {};
