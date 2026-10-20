import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionButton } from "@manifest-editor/components";
import { ToastProvider, useToasts } from "@manifest-editor/shell";
import { useState } from "react";
import { JsonPanel, StoryFrame } from "../../support/StoryFrame";

function NotificationActions({ example, timeout }: { example: "variants" | "undo" | "queue"; timeout: number }) {
  const toasts = useToasts();
  const [removed, setRemoved] = useState(false);
  return (
    <div className="sb-pane">
      {example === "variants" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {(["info", "success", "warning", "error"] as const).map((variant) => (
            <ActionButton
              key={variant}
              onPress={() =>
                toasts[variant](
                  {
                    title: `${variant[0]?.toUpperCase()}${variant.slice(1)} notification`,
                    description: "A production toast with its matching icon and color.",
                  },
                  { timeout }
                )
              }
            >
              Show {variant}
            </ActionButton>
          ))}
        </div>
      ) : example === "undo" ? (
        <>
          <ActionButton
            primary
            onPress={() => {
              setRemoved(true);
              toasts.info(
                {
                  title: "Canvas removed from this example",
                  description: "Undo restores the local selection.",
                  action: { label: "Undo removal", onPress: () => setRemoved(false) },
                },
                { timeout }
              );
            }}
          >
            Remove example canvas
          </ActionButton>
          <JsonPanel title="Local state" value={{ canvasPresent: !removed }} />
        </>
      ) : (
        <ActionButton
          primary
          onPress={() => {
            for (let i = 1; i <= 5; i++)
              toasts.info(
                {
                  title: `Queued notification ${i}`,
                  description: "Only two notifications are visible at once. Dismiss one to show the next.",
                },
                { timeout: 0 }
              );
          }}
        >
          Queue five notifications
        </ActionButton>
      )}
    </div>
  );
}

function Notifications({
  example = "variants",
  timeout = 10000,
}: {
  example?: "variants" | "undo" | "queue";
  timeout?: number;
}) {
  const [version, setVersion] = useState(0);
  return (
    <StoryFrame
      title="Notifications"
      summary="The shell's actual ToastProvider and ToastRegion handle variants, actions, queueing and dismissal. Reset removes the queue and local state."
      onReset={() => setVersion((v) => v + 1)}
    >
      <ToastProvider key={`${example}-${version}`} maxVisibleToasts={example === "queue" ? 2 : 3}>
        <NotificationActions example={example} timeout={timeout} />
      </ToastProvider>
    </StoryFrame>
  );
}
const meta = {
  title: "Components/Notifications",
  component: Notifications,
  args: { example: "variants", timeout: 10000 },
  argTypes: {
    example: { control: "select", options: ["variants", "undo", "queue"] },
    timeout: {
      control: { type: "number", min: 0, step: 1000 },
      description: "Milliseconds; zero leaves notifications open until dismissed.",
    },
  },
} satisfies Meta<typeof Notifications>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Variants: Story = {};
export const UndoAction: Story = { args: { example: "undo" } };
export const QueueAndDismissal: Story = { args: { example: "queue", timeout: 0 } };
