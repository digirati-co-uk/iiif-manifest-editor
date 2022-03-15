import { useContext } from "react";
import { CalltoButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import ShellContext from "../Shell/ShellContext";

export const Splash: React.FC<{ welcome: any }> = ({ welcome }) => {
  const shellContext = useContext(ShellContext);

  return (
    <FlexContainerColumn justify="flex-start">
      <div
        className="text-container"
        dangerouslySetInnerHTML={{ __html: welcome }}
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
