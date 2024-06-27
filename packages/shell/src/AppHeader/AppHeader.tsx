import { Logo, Container, Header } from "./AppHeader.styles";
import { PreviewButton } from "../PreviewButton/PreviewButton";
import { ManifestEditorLogo } from "@manifest-editor/components";

import { memo } from "react";
import { useLocalStorage } from "@manifest-editor/ui/madoc/use-local-storage";

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

        {/*<IconButton>•</IconButton>*/}
      </Container>
      {/* {!isMenuHidden ? <ShellOptions /> : null} */}
    </Header>
  );
});
