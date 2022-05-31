import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { ProjectListing } from "./components/ProjectListing/ProjectListing";

export default { id: "project-manager", title: "Project manager", dev: true };

export const centerPanels: LayoutPanel[] = [
  {
    id: "project-manager",
    label: "Project manager",
    icon: null,
    render: () => {
      return <ProjectListing />;
    },
  },
];
