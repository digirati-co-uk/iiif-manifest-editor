import { Logo, Container, ProjectPreview, Header } from "./AppHeader.styles";
import { useApps } from "../AppContext/AppContext";
import { PreviewButton } from "../../components/organisms/PreviewButton/PreviewButton";
import { ShellOptions } from "../../apps/Shell/ShellOptions";
import { ManifestEditorLogo } from "../../atoms/ManifestEditorLogo";
import { useLocalStorage } from "../../madoc/use-local-storage";
import { DraftTitleEditor } from "./components/DraftTitleEditor";
import { AppMenu } from "./components/AppMenu";
import { memo } from "react";

export const AppHeader = memo(function AppHeader() {
  const [isMenuHidden] = useLocalStorage("menu-hidden");
  const { changeApp, initialApp, currentApp, apps } = useApps();
  const app = apps[currentApp?.id];

  return (
    <Header>
      <Container>
        <AppMenu />

        <Logo onClick={() => changeApp(initialApp)}>
          <ManifestEditorLogo height={27} width={200} />
        </Logo>

        {app && app.metadata.drafts === false ? null : (
          <ProjectPreview>
            <DraftTitleEditor />
            {/*<ContextButton>{state.canvasId ? "Canvas" : "Manifest"}</ContextButton>*/}
          </ProjectPreview>
        )}

        <PreviewButton />

        {/*<IconButton>•</IconButton>*/}
      </Container>
      {!isMenuHidden ? <ShellOptions /> : null}
    </Header>
  );
});
