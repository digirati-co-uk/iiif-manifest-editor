import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { AboutText } from "./components/AboutText";

export default { id: "empty", title: "Empty shell", dev: true };

export const centerPanels: LayoutPanel[] = [
  {
    id: "center-panel-empty",
    label: "Center panel",
    icon: "",
    render: () => <div />,
  },
];
export const leftPanels: LayoutPanel[] = [
  {
    id: "left-panel-empty",
    label: "Left panel",
    icon: "",
    render: () => <div />,
  },
];
export const rightPanels: LayoutPanel[] = [
  {
    id: "right-panel-empty",
    label: "Right panel",
    icon: "",
    render: () => <div />,
  },
];
