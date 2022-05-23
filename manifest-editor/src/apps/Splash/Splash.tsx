import { FlexContainerColumn } from "../../components/layout/FlexContainer";
import { useShell } from "../../context/ShellContext/ShellContext";
import { RecentFiles } from "../../components/widgets/RecentFiles";
import { NewTemplates } from "../../components/widgets/NewTemplates";
import { PaddingComponentLarge } from "../../atoms/PaddingComponent";
import { LoadManifest } from "../../components/widgets/LoadManifest";
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
        <FlexContainerColumn>
          <PaddingComponentLarge />
          <LoadManifest />
          <PaddingComponentLarge />
          <NewTemplates newTemplates={shellContext.newTemplates} changeManifest={handleClick} />
          <PaddingComponentLarge />
          <RecentFiles recentManifests={shellContext.recentManifests} changeManifest={handleClick} />
          <PaddingComponentLarge />
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
