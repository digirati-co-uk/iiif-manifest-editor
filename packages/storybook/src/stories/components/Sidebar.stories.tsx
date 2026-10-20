import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AddIcon,
  EmptyState,
  InfoIcon,
  PaddedSidebarContainer,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import { useState } from "react";
import { StoryFrame } from "../../support/StoryFrame";

function SidebarLayout({ title = "Canvas properties", padding = true }: { title?: string; padding?: boolean }) {
  const [message, setMessage] = useState("Choose a header action to try the sidebar.");
  return (
    <StoryFrame
      title="Sidebar layout"
      summary="Header actions, scrollable content and padded containers, without an editor shell."
      onReset={() => setMessage("Choose a header action to try the sidebar.")}
    >
      <div className="sb-pane" style={{ height: 440, width: "100%", maxWidth: 420, padding: 0, overflow: "hidden" }}>
        <Sidebar>
          <SidebarHeader
            title={title}
            actions={[
              {
                title: "Add a property",
                icon: <AddIcon />,
                onClick: () => setMessage("Add property action selected."),
              },
              {
                title: "About this panel",
                icon: <InfoIcon />,
                onClick: () => setMessage("This is the editor's reusable sidebar layout."),
              },
            ]}
          />
          <SidebarContent padding={padding}>
            <PaddedSidebarContainer>
              <EmptyState $box>No properties to display.</EmptyState>
              <output style={{ display: "block" }}>{message}</output>
            </PaddedSidebarContainer>
          </SidebarContent>
        </Sidebar>
      </div>
    </StoryFrame>
  );
}

const meta = {
  title: "Components/Sidebar",
  component: SidebarLayout,
  args: { title: "Canvas properties", padding: true },
} satisfies Meta<typeof SidebarLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const HeaderAndLayout: Story = {};
