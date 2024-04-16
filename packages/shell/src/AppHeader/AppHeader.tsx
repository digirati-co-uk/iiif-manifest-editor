import { Logo, Container, Header } from "./AppHeader.styles";
import { PreviewButton } from "../PreviewButton/PreviewButton";
import { ManifestEditorLogo } from "@manifest-editor/ui/atoms/ManifestEditorLogo";

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
          <ManifestEditorLogo height={27} width={200} />
        </Logo>

        <PreviewButton />

        {/*<IconButton>•</IconButton>*/}
      </Container>
      {/* {!isMenuHidden ? <ShellOptions /> : null} */}
    </Header>
  );
});
