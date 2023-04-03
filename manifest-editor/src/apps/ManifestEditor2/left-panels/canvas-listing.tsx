import { LayoutFunction, LayoutPanel } from "@/shell/Layout/Layout.types";

export const canvasListing: LayoutPanel = {
  id: "left-panel-empty",
  label: "Left panel",
  icon: "",
  render: (state, ctx, app) => {
    return <div>Left panel</div>;
  },
};
