import { useContext, useEffect } from "react";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import ShellContext from "../Shell/ShellContext";
import { RecentFiles } from "../../widgets/RecentFiles";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { NewTemplates } from "../../widgets/NewTemplates";
import { WelcomeTextContainer } from "../../atoms/WelcomeText";
import { PaddingComponentLarge } from "../../atoms/PaddingComponent";

export const Splash: React.FC<{ welcome: any }> = ({ welcome }) => {
  const shellContext = useContext(ShellContext);

  const handleClick = (id: string) => {
    shellContext?.changeResourceID(id);
    shellContext?.changeSelectedApplication("ManifestEditor");
  };

  return (
    <FlexContainerColumn
      justify="flex-start"
      style={{ maxWidth: "80%", margin: "auto" }}
    >
      <div dangerouslySetInnerHTML={{ __html: welcome }} />
      <PaddingComponentLarge />
      <NewTemplates
        newTemplates={shellContext?.newTemplates}
        changeManifest={handleClick}
      />
      <PaddingComponentLarge />

      <RecentFiles
        recentManifests={shellContext?.recentManifests}
        changeManifest={handleClick}
      />

      <PaddingComponentLarge />
    </FlexContainerColumn>
  );
};
