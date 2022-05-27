import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { GridIcon } from "../../icons/GridIcon";
import { PreviewIcon } from "../../icons/PreviewIcon";
import { SingleLabelEditor } from "./components/SingleLabelEditor";
import { CanvasList } from "./components/CanvasList";
import { CurrentCanvas } from "./components/CurrentCanvas";

export default { id: "label-editor", title: "Labels", project: true };

export const leftPanels: LayoutPanel[] = [
  {
    id: "canvas-list",
    label: "Canvas list",
    icon: <GridIcon />,
    render: () => <CanvasList />,
  },
];

export const centerPanels: LayoutPanel[] = [
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: () => <CurrentCanvas />,
  },
];

export const rightPanels: LayoutPanel[] = [
  {
    id: "label-editor",
    label: "Label editor",
    icon: <PreviewIcon />,
    render: ({ id }) => <SingleLabelEditor resource={id ? { id, type: "Canvas" } : undefined} />,
    options: {
      pinnable: true,
    },
  },
];
