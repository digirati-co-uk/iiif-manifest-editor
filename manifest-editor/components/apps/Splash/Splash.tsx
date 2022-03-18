import { useContext } from "react";
import { CalltoButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import ShellContext from "../Shell/ShellContext";
import { RecentFiles } from "../../widgets/RecentFiles";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";

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
      <RecentFiles
        recentManifests={shellContext?.recentManifests}
        changeManifest={handleClick}
      />
      <HorizontalDivider />
      <FlexContainer style={{ justifyContent: "flex-end" }}>
        <CalltoButton
          onClick={() =>
            shellContext?.changeSelectedApplication("ManifestEditor")
          }
        >
          Get started
        </CalltoButton>
      </FlexContainer>
    </FlexContainerColumn>
  );
};
