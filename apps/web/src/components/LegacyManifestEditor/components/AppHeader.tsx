import { AppMenu, DraftTitleEditor } from "@manifest-editor/projects";
import { useApps, PreviewButton } from "@manifest-editor/shell";
import { ManifestEditorLogo } from "@manifest-editor/ui/atoms/ManifestEditorLogo";
import { useLocalStorage } from "@manifest-editor/ui/madoc/use-local-storage";
import { Logo, Container, ProjectPreview, Header } from "./AppHeader.styles";
import { memo } from "react";
import { ShellOptions } from "./ShellOptions";

interface AppHeaderProps {
  onClickLogo?: () => void;
}

export const AppHeader = memo(function AppHeader(props: AppHeaderProps) {
  const [isMenuHidden] = useLocalStorage("menu-hidden", true);
  const { changeApp, initialApp, currentApp, apps } = useApps();
  const app = apps[currentApp?.id];

  return (
    <Header>
      <Container>
        <AppMenu />

        <Logo onClick={props.onClickLogo || (() => changeApp(initialApp))}>
          <ManifestEditorLogo height={27} width={200} />
        </Logo>

        {app && app.metadata.drafts === false ? null : (
          <ProjectPreview>
            <DraftTitleEditor />
            {/*<ContextButton>{state.canvasId ? "Canvas" : "Manifest"}</ContextButton>*/}
          </ProjectPreview>
        )}

        {app && app.metadata.drafts === false ? null : <PreviewButton />}

        {/*<IconButton>•</IconButton>*/}
      </Container>
      {!isMenuHidden ? <ShellOptions /> : null}
    </Header>
  );
});
