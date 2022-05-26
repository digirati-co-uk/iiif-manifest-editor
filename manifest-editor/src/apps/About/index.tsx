import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { AboutText } from "./components/AboutText";

export default { id: "about", title: "About" };

export const centerPanels: LayoutPanel[] = [
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: () => <AboutText />,
  },
];
