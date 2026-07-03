import { Logo, Container, Header } from "./AppHeader.styles";
import { PreviewButton } from "../PreviewButton/PreviewButton";
import { BackgroundActionsMenu } from "../BackgroundTasks/BackgroundActions";
import { ManifestEditorLogo } from "@manifest-editor/components";

import { memo } from "react";
import { useLocalStorage } from "../hooks/use-local-storage";
import { PresetOnboardingButton } from "../PresetOnboarding/PresetOnboarding";

interface AppHeaderProps {
  onClickLogo?: () => void;
}

export const AppHeader = memo(function AppHeader(props: AppHeaderProps) {
  const [isMenuHidden] = useLocalStorage("menu-hidden");

  return (
    <Header>
      <Container>
        <Logo onClick={props.onClickLogo}>
          <ManifestEditorLogo />
        </Logo>

        <PreviewButton />
        <PresetOnboardingButton />
        <BackgroundActionsMenu />

        {/*<IconButton>•</IconButton>*/}
      </Container>
      {/* {!isMenuHidden ? <ShellOptions /> : null} */}
    </Header>
  );
});
