import type { Meta, StoryObj } from "@storybook/react-vite";
import { ManifestOverviewEmptyState } from "@manifest-editor/components";
import { useState } from "react";
import { StoryFrame } from "../../support/StoryFrame";

function EmptyOverview({ canCreate = true }: { canCreate?: boolean }) {
  const [requests, setRequests] = useState(0);
  return (
    <StoryFrame
      title="Empty manifest overview"
      summary="The editor's introductory state includes its interactive Card3D surface and content creation action. Read-only configuration retains the guidance."
      onReset={() => setRequests(0)}
    >
      <div className="sb-pane">
        <ManifestOverviewEmptyState canCreate={canCreate} onCreate={() => setRequests((n) => n + 1)} />
      </div>
      <output>
        {requests ? `Creation requested ${requests} time${requests === 1 ? "" : "s"}.` : "No creation requested."}
      </output>
    </StoryFrame>
  );
}
const meta = { title: "Components/Empty overview", component: EmptyOverview, args: { canCreate: true } } satisfies Meta<
  typeof EmptyOverview
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StartCreating: Story = {};
export const ReadOnlyGuidance: Story = { args: { canCreate: false } };
