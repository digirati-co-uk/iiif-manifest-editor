import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionButton, Form, Modal } from "@manifest-editor/components";
import { useId, useState, type ChangeEvent } from "react";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

function Dialogs({ longContent = false }: { longContent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Untitled manifest");
  const [saved, setSaved] = useState<string>();
  const id = useId();
  return (
    <StoryFrame
      title="Modal dialogs"
      summary="Open the modal, change a title and confirm or cancel. Escape and the close button dismiss it; focus returns to the trigger."
      onReset={() => {
        setOpen(false);
        setLabel("Untitled manifest");
        setSaved(undefined);
      }}
    >
      <div className="sb-pane">
        <ActionButton primary onPress={() => setOpen(true)}>
          Edit title
        </ActionButton>
        <JsonPanel title="Confirmed result" value={saved ? { label: saved } : null} />
      </div>
      <Modal
        title="Edit manifest title"
        open={open}
        onClose={() => setOpen(false)}
        width={560}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <ActionButton onPress={() => setOpen(false)}>Cancel</ActionButton>
            <ActionButton
              primary
              onPress={() => {
                setSaved(label);
                setOpen(false);
              }}
            >
              Save title
            </ActionButton>
          </div>
        }
      >
        <div className="p-4">
          <label htmlFor={id}>Manifest title</label>
          <Form.Input
            id={id}
            value={label}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setLabel(event.target.value)}
            className="w-full"
          />
          {longContent ? (
            Array.from({ length: 12 }, (_, i) => (
              <p key={i} className="py-4">
                Section {i + 1}: the dialog body scrolls while its title and confirmation actions remain available.
              </p>
            ))
          ) : (
            <p className="py-4">This local example does not modify a IIIF resource.</p>
          )}
        </div>
      </Modal>
    </StoryFrame>
  );
}

const meta = { title: "Components/Dialogs", component: Dialogs, args: { longContent: false } } satisfies Meta<
  typeof Dialogs
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ConfirmChanges: Story = {};
export const ScrollableContent: Story = { args: { longContent: true } };
