import { CreateCanvasIcon, Sidebar, SidebarHeader } from "@manifest-editor/components";
import { useCreator, useManifestEditor } from "@manifest-editor/shell";
import { useToggleList } from "@manifest-editor/editors";

export const id = 'example-left';

export const label = 'Example left';

export const icon = <>🎵</>;

export const render = () => <ExampleLeftPanel />;


function ExampleLeftPanel() {
  const { structural, technical } = useManifestEditor();
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Manifest");
  const [toggled, toggle] = useToggleList();

  console.log(toggled)
  return (
    <Sidebar>
      <SidebarHeader title={'Example left panel'} actions={[
        {
          icon: <ExhibitionGridIcon/>,
          title: 'grid view',
          onClick: () => console.log('Grid view')
        },
        {
          icon: <ListEditIcon />,
          title: "Edit slides",
          onClick: () => toggle("items"),
        },
        {
          icon: <NewSlideIcon />,
          title: "Add new slide",
          onClick: () => canvasActions.create(),
        },
      ]} />

      <p>This is an example left panel.</p>
    </Sidebar>
  );
}

function ExhibitionGridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5f6368" viewBox="0 -960 960 960" >
      <path d="M600-160v-280h280v280H600ZM440-520v-280h440v280H440ZM80-160v-280h440v280H80Zm0-360v-280h280v280H80Zm440-80h280v-120H520v120ZM160-240h280v-120H160v120Zm520 0h120v-120H680v120ZM160-600h120v-120H160v120Zm360 0Zm-80 240Zm240 0ZM280-600Z" />
    </svg>
  );
}
function ListEditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
    </svg>
  );
}
function NewSlideIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5f6368" viewBox="0 -960 960 960" >
      <path
        d="M160-240v-480 480Zm80-80v-200h360v200H240Zm-80 160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240h-80v-240H160v480h360v80H160Zm500-320v-100H360v-60h360v160h-60Zm60 400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
    </svg>
  );
}