import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreMenuButton } from "@manifest-editor/components";
import { useState } from "react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { StoryFrame } from "../../support/StoryFrame";

function ResourceActions() {
  const [action, setAction] = useState("No action selected");
  return (
    <StoryFrame
      title="More actions menu"
      summary="The production MoreMenuButton opens a keyboard accessible resource action menu. These actions only update the local outcome."
      onReset={() => setAction("No action selected")}
    >
      <div className="sb-pane" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span>Untitled canvas</span>
        <MenuTrigger>
          <MoreMenuButton />
          <Popover className="manifest-editor">
            <Menu
              aria-label="Resource actions"
              className="bg-white p-2 rounded shadow-lg border border-gray-200"
              onAction={(key) => setAction(String(key))}
            >
              <MenuItem id="Duplicate canvas" className="p-2 rounded cursor-pointer data-[focused]:bg-me-primary-100">
                Duplicate canvas
              </MenuItem>
              <MenuItem id="Copy resource ID" className="p-2 rounded cursor-pointer data-[focused]:bg-me-primary-100">
                Copy resource ID
              </MenuItem>
              <MenuItem id="Inspect resource" className="p-2 rounded cursor-pointer data-[focused]:bg-me-primary-100">
                Inspect resource
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>
      <output>{action}</output>
    </StoryFrame>
  );
}
const meta = { title: "Components/More actions", component: ResourceActions } satisfies Meta<typeof ResourceActions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ResourceMenu: Story = {};
