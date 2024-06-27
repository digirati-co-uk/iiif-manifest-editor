import { LayoutPanel } from "@manifest-editor/shell";
import { AboutText } from "./components/AboutText";

export default { id: "about", title: "About" };

export const centerPanels: LayoutPanel[] = [
  {
    id: "about-text",
    label: "About Manifest editor",
    icon: "",
    render: () => <AboutText />,
  },
];
