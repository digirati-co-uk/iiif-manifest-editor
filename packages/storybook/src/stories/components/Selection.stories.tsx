import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfirmSelectionButton, SelectionCheckbox } from "@manifest-editor/components";
import { useState } from "react";
import { ListBox, ListBoxItem, type Selection } from "react-aria-components";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

const items = [
  { id: "canvas-1", label: "Front cover" },
  { id: "canvas-2", label: "Title page" },
  { id: "canvas-3", label: "First chapter" },
];
function SelectionExample({
  mode = "multiple",
  alwaysVisible = true,
}: {
  mode?: "single" | "multiple";
  alwaysVisible?: boolean;
}) {
  const [selected, setSelected] = useState<Selection>(new Set());
  const [confirmed, setConfirmed] = useState<string[]>([]);
  return (
    <StoryFrame
      title="Resource selection"
      summary="The editor's selection checkbox participates in React Aria list selection. Choose rows, then confirm the selected resource IDs."
      onReset={() => {
        setSelected(new Set());
        setConfirmed([]);
      }}
    >
      <div className="sb-split">
        <div className="sb-pane">
          <ListBox
            aria-label="Canvases"
            selectionMode={mode}
            selectionBehavior="toggle"
            selectedKeys={selected}
            onSelectionChange={setSelected}
            items={items}
            className="flex flex-col gap-2 mb-4"
          >
            {(item) => (
              <ListBoxItem
                id={item.id}
                textValue={item.label}
                className="group flex items-center gap-3 p-3 rounded border border-gray-200 data-[selected]:bg-me-primary-100 focus-visible:outline-me-primary-500"
              >
                <SelectionCheckbox alwaysVisible={alwaysVisible} />
                <span>{item.label}</span>
              </ListBoxItem>
            )}
          </ListBox>
          <ConfirmSelectionButton
            onPress={() => setConfirmed(selected === "all" ? items.map((i) => i.id) : Array.from(selected, String))}
          >
            Confirm selection
          </ConfirmSelectionButton>
        </div>
        <JsonPanel title="Confirmed IDs" value={confirmed} />
      </div>
    </StoryFrame>
  );
}

const meta = {
  title: "Components/Selection",
  component: SelectionExample,
  args: { mode: "multiple", alwaysVisible: true },
  argTypes: { mode: { control: "inline-radio", options: ["single", "multiple"] } },
} satisfies Meta<typeof SelectionExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MultipleResources: Story = {};
export const SingleResource: Story = { args: { mode: "single" } };
