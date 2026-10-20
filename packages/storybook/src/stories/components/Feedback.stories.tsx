import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState, ErrorMessage, InfoMessage, Spinner, WarningMessage } from "@manifest-editor/components";
import { StoryFrame } from "../../support/StoryFrame";

function Feedback({ small = false }: { small?: boolean }) {
  return (
    <StoryFrame title="Feedback" summary="Empty, loading and message states used throughout the editor.">
      <div className="sb-pane" style={{ display: "grid", gap: 20 }}>
        <EmptyState $box>No canvases yet. Add a canvas to begin.</EmptyState>
        <InfoMessage small={small}>Changes are stored in this editing session.</InfoMessage>
        <WarningMessage small={small}>This resource has no rights statement.</WarningMessage>
        <ErrorMessage small={small}>The remote resource could not be loaded.</ErrorMessage>
        <output style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Spinner aria-hidden="true" /> Loading resource…
        </output>
      </div>
    </StoryFrame>
  );
}

const meta = { title: "Components/Feedback", component: Feedback, args: { small: false } } satisfies Meta<
  typeof Feedback
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const States: Story = {};
