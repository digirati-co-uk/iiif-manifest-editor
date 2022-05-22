import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { ProjectListing } from "./components/ProjectListing/ProjectListing";

export default { title: "Project manager" };

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
