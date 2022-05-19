import { Layout } from "../../shell/Layout/Layout";
import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { GridIcon } from "../../icons/GridIcon";
import { PreviewIcon } from "../../icons/PreviewIcon";
import { ManifestEditorProvider } from "../ManifestEditor/ManifestEditor.context";
import { SingleLabelEditor } from "./components/SingleLabelEditor";
import { CanvasList } from "./components/CanvasList";
import { CurrentCanvas } from "./components/CurrentCanvas";

const leftPanels: LayoutPanel[] = [
  {
    id: "canvas-list",
    label: "Canvas list",
    icon: <GridIcon />,
    render: () => <CanvasList />,
  },
];

const centerPanels: LayoutPanel[] = [
  {
    id: "current-canvas",
    label: "Current canvas",
    icon: "",
    render: () => <CurrentCanvas />,
  },
];

const rightPanels: LayoutPanel[] = [
  {
    id: "label-editor",
    label: "Label editor",
    icon: <PreviewIcon />,
    pinnable: true,
    render: (state) => <SingleLabelEditor resource={state} />,
  },
];

export function LabelEditor() {
  return (
    <ManifestEditorProvider defaultLanguages={[]} behaviorProperties={[]}>
      <Layout
        //
        leftPanels={leftPanels}
        centerPanels={centerPanels}
        rightPanels={rightPanels}
        menu={<div>menu</div>}
      />
    </ManifestEditorProvider>
  );
}
