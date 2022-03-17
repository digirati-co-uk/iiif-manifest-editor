import { useContext } from "react";
import { CalltoButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import ShellContext from "../Shell/ShellContext";
import { RecentFiles } from "../Widgets/RecentFiles";

export const Splash: React.FC<{ welcome: any }> = ({ welcome }) => {
  const shellContext = useContext(ShellContext);

  const handleClick = (id: string) => {
    shellContext?.changeResourceID(id);
    shellContext?.changeSelectedApplication("ManifestEditor");
  };

  return (
    <FlexContainerColumn justify="flex-start">
      <div dangerouslySetInnerHTML={{ __html: welcome }} />
      <RecentFiles
        recentManifests={shellContext?.recentManifests}
        changeManifest={handleClick}
      />
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
