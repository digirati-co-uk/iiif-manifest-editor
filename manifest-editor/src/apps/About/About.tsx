import { Layout } from "../../shell/Layout/Layout";
import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { ManifestEditorProvider } from "../ManifestEditor/ManifestEditor.context";
import { AboutText } from "./components/AboutText";

const leftPanels: LayoutPanel[] = [];

const centerPanels: LayoutPanel[] = [
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: () => <AboutText />,
  },
];

const rightPanels: LayoutPanel[] = [];

export function About() {
  return (
    <ManifestEditorProvider defaultLanguages={[]} behaviorProperties={[]}>
      <Layout
        //
        leftPanels={leftPanels}
        centerPanels={centerPanels}
        rightPanels={rightPanels}
      />
    </ManifestEditorProvider>
  );
}
