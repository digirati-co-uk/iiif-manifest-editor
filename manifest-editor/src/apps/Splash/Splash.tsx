import { FlexContainerColumn } from "../../components/layout/FlexContainer";
import { useShell } from "../../context/ShellContext/ShellContext";
import { RecentFiles } from "../../components/widgets/RecentFiles";
import { NewTemplates } from "../../components/widgets/NewTemplates";
import { PaddingComponentLarge } from "../../atoms/PaddingComponent";

export const Splash: React.FC<{ welcome: any }> = ({ welcome }) => {
  const shellContext = useShell();

  const handleClick = (id: string) => {
    shellContext.changeResourceID(id);
    shellContext.changeSelectedApplication("ManifestEditor");
  };

  return (
    <FlexContainerColumn justify="flex-start" style={{ maxWidth: "80%", margin: "auto" }}>
      <div dangerouslySetInnerHTML={{ __html: welcome }} />
      <PaddingComponentLarge />
      <NewTemplates newTemplates={shellContext.newTemplates} changeManifest={handleClick} />
      <PaddingComponentLarge />

      <RecentFiles recentManifests={shellContext.recentManifests} changeManifest={handleClick} />

      <PaddingComponentLarge />
    </FlexContainerColumn>
  );
};
