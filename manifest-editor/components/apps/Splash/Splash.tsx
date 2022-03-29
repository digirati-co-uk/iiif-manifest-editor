import { useContext, useEffect } from "react";
import { CalltoButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import ShellContext from "../Shell/ShellContext";
import { RecentFiles } from "../../widgets/RecentFiles";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { NewTemplates } from "../../widgets/NewTemplates";

export const Splash: React.FC<{ welcome: any }> = ({ welcome }) => {
  const shellContext = useContext(ShellContext);

  const handleClick = (id: string) => {
    shellContext?.changeResourceID(id);
    shellContext?.changeSelectedApplication("ManifestEditor");
  };

  return (
    <FlexContainerColumn justify="flex-start">
      <div dangerouslySetInnerHTML={{ __html: welcome }} />
      <HorizontalDivider />
      <NewTemplates
        newTemplates={shellContext?.newTemplates}
        changeManifest={handleClick}
      />
      <HorizontalDivider />

      <RecentFiles
        recentManifests={shellContext?.recentManifests}
        changeManifest={(id: string) => handleClick(id)}
      />

      <HorizontalDivider />
    </FlexContainerColumn>
  );
};
