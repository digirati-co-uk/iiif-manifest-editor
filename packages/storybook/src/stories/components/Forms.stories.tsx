import type { Meta, StoryObj } from "@storybook/react-vite";
import { Form } from "@manifest-editor/components";
import { useId, useState, type ChangeEvent } from "react";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

function FormControls({ disabled = false }: { disabled?: boolean }) {
  const id = useId();
  const initial = { label: "A new resource", summary: "Describe this resource.", visibility: "public" };
  const [value, setValue] = useState(initial);
  return (
    <StoryFrame
      title="Form controls"
      summary="The editor's input, textarea and radio selection controls, with their values alongside."
      onReset={() => setValue(initial)}
    >
      <div className="sb-split">
        <div className="sb-pane" style={{ display: "grid", gap: 24 }}>
          <Form.InputContainer>
            <label htmlFor={`${id}-label`}>Label</label>
            <Form.Input
              id={`${id}-label`}
              disabled={disabled}
              value={value.label}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setValue({ ...value, label: event.target.value })}
            />
          </Form.InputContainer>
          <Form.InputContainer>
            <label htmlFor={`${id}-summary`}>Summary</label>
            <Form.TextArea
              id={`${id}-summary`}
              disabled={disabled}
              rows={4}
              value={value.summary}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setValue({ ...value, summary: event.target.value })
              }
            />
          </Form.InputContainer>
          <Form.RadioGroup
            aria-label="Visibility"
            isDisabled={disabled}
            value={value.visibility}
            onChange={(visibility: string) => setValue({ ...value, visibility })}
          >
            <p>Visibility</p>
            <div style={{ display: "flex", gap: 24 }}>
              {["public", "private"].map((visibility) => (
                <div key={visibility} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Form.Radio value={visibility} aria-label={visibility} />
                  <span>{visibility}</span>
                </div>
              ))}
            </div>
          </Form.RadioGroup>
        </div>
        <JsonPanel title="Form values" value={value} />
      </div>
    </StoryFrame>
  );
}

const meta = { title: "Components/Form controls", component: FormControls, args: { disabled: false } } satisfies Meta<
  typeof FormControls
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const InputTextareaAndSelection: Story = {};
