import { FlexContainerColumn } from "../../components/layout/FlexContainer";
import { useShell } from "../../context/ShellContext/ShellContext";
import { RecentFiles } from "../../components/widgets/RecentFiles";
import { PaddingComponentLarge } from "../../atoms/PaddingComponent";
import { LoadManifest } from "../../components/widgets/LoadManifest/LoadManifest";
import { Layout } from "../../shell/Layout/Layout";
import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { ManifestEditorProvider } from "../ManifestEditor/ManifestEditor.context";

export function Splash() {
  const shellContext = useShell();

  const handleClick = (id: string) => {
    shellContext.changeResourceID(id);
    shellContext.changeSelectedApplication("ManifestEditor");
  };

  const leftPanels: LayoutPanel[] = [];

  const centerPanels: LayoutPanel[] = [
    {
      id: "splash",
      label: "Splash Screen",
      icon: "",
      render: () => (
        <FlexContainerColumn style={{ height: "100%", justifyContent: "space-between" }}>
          <div>
            <PaddingComponentLarge />
            <LoadManifest />
            <PaddingComponentLarge />
          </div>
          <div style={{ width: "100%", height: "50%", backgroundColor: "white" }}>
            <FlexContainerColumn style={{ width: "90%", margin: "auto" }}>
              <RecentFiles recentManifests={shellContext.recentManifests} changeManifest={handleClick} />
            </FlexContainerColumn>
          </div>
        </FlexContainerColumn>
      ),
    },
  ];

  const rightPanels: LayoutPanel[] = [];

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
