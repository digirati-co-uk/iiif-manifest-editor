import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import { useToggleList } from "@manifest-editor/editors";
import {
  CanvasListView,
  CanvasListingIcon,
} from "@manifest-editor/manifest-preset/components";
import {
  type LayoutPanel,
  useCreator,
  useManifestEditor,
} from "@manifest-editor/shell";
import { ExhibitionGrid } from "../components/ExhibitionGrid";
import { SortableExhibitionGrid } from "../components/SortableExhibitionGrid";

export const exhibitionGridLeftPanel: LayoutPanel = {
  id: "exhibition-grid-left-panel",
  label: "Exhibition grid",
  icon: <ExhibitionGridIcon />,
  render: () => <ExhibitionGridLeftPanel />,
  options: {
    minWidth: 350,
    maxWidth: 350,
  },
};

function ExhibitionGridLeftPanel() {
  const { technical } = useManifestEditor();
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(
    manifest,
    "items",
    "Canvas",
  );
  const [toggled, toggle] = useToggleList();

  return (
    <Sidebar>
      <SidebarHeader
        title={"Exhibition"}
        actions={[
          {
            icon: toggled.list ? (
              <CanvasListingIcon className="text-2xl" />
            ) : (
              <ExhibitionGridIcon />
            ),
            title: toggled.list ? "List view" : "Grid view",
            onClick: () => toggle("list"),
          },
          {
            icon: <ListEditIcon />,
            title: "Edit slides",
            toggled: toggled.editing,
            onClick: () => toggle("editing"),
          },
          {
            icon: <NewSlideIcon />,
            title: "Add new slide",
            disabled: !canCreateCanvas,
            onClick: () => canvasActions.createFiltered("exhibition-slide"),
          },
        ]}
      />
      <SidebarContent>
        {toggled.list ? (
          <CanvasListView isEditing={toggled.editing} />
        ) : toggled.editing ? (
          <SortableExhibitionGrid />
        ) : (
          <ExhibitionGrid />
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function ExhibitionGridIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 -960 960 960"
    >
      <title>Exhibition grid</title>
      <path d="M600-160v-280h280v280H600ZM440-520v-280h440v280H440ZM80-160v-280h440v280H80Zm0-360v-280h280v280H80Zm440-80h280v-120H520v120ZM160-240h280v-120H160v120Zm520 0h120v-120H680v120ZM160-600h120v-120H160v120Zm360 0Zm-80 240Zm240 0ZM280-600Z" />
    </svg>
  );
}
function ListEditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <title>Edit slides</title>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
    </svg>
  );
}
function NewSlideIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 -960 960 960"
    >
      <title>Add new slide</title>
      <path d="M160-240v-480 480Zm80-80v-200h360v200H240Zm-80 160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240h-80v-240H160v480h360v80H160Zm500-320v-100H360v-60h360v160h-60Zm60 400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
    </svg>
  );
}
