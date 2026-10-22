import type { Meta, StoryObj } from "@storybook/react-vite";
import { DefaultTooltipContent, Tooltip, TooltipTrigger } from "@manifest-editor/components";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { StoryFrame } from "../../support/StoryFrame";

function PortalTooltip({ explicitRoot = false }: { explicitRoot?: boolean }) {
  return (
    <StoryFrame
      title="Tooltip portal"
      summary="Hover or focus the trigger. Portal content keeps editor styles even outside the editor root; Escape dismisses it."
    >
      <div className="sb-pane" style={{ padding: 48 }}>
        <Tooltip placement="bottom">
          <TooltipTrigger className="sb-button">Resource information</TooltipTrigger>
          <DefaultTooltipContent root={explicitRoot ? document.body : undefined}>
            View this resource’s IIIF properties
          </DefaultTooltipContent>
        </Tooltip>
      </div>
    </StoryFrame>
  );
}

const meta = {
  title: "Components/Tooltip",
  component: PortalTooltip,
  args: { explicitRoot: false },
} satisfies Meta<typeof PortalTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultPortal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Resource information" });
    await userEvent.hover(trigger);
    const tooltip = await page.findByRole("tooltip");
    await waitFor(() => {
      expect(tooltip.closest(".manifest-editor")).not.toBeNull();
      expect(getComputedStyle(tooltip).paddingLeft).toBe("12px");
      expect(getComputedStyle(tooltip).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("tooltip")).toBeNull());
    await userEvent.unhover(trigger);
  },
};

export const ExplicitBodyPortal: Story = {
  args: { explicitRoot: true },
  play: DefaultPortal.play,
};
