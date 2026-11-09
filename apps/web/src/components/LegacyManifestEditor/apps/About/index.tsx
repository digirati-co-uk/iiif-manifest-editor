import { LayoutPanel } from "@manifest-editor/shell";
import { AboutText } from "./components/AboutText";

export default { id: "about", title: "About", titleMessage: { namespace: "web", key: "legacy.about" } };

export const centerPanels: LayoutPanel[] = [
  {
    id: "about-text",
    label: "About Manifest editor",
    labelMessage: { namespace: "web", key: "legacy.aboutTitle" },
    icon: "",
    render: () => <AboutText />,
  },
];
