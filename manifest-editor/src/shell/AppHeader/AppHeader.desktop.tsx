import { Logo, Container, ProjectPreview, Header } from "./AppHeader.styles";
import { useProjectContext } from "../ProjectContext/ProjectContext";
import { useApps } from "../AppContext/AppContext";
import { PreviewButton } from "../../components/organisms/PreviewButton/PreviewButton";
import { ShellOptions } from "../../apps/Shell/ShellOptions";
import { ManifestEditorLogo } from "../../atoms/ManifestEditorLogo";
import { MappedApp } from "../../apps/app-loader";
import { useLocalStorage } from "../../madoc/use-local-storage";
import { useEffect, useState } from "react";
import { DraftTitleEditor } from "./components/DraftTitleEditor";
import { useAppWindowEvent } from "../DesktopContext/hooks/useAppWindowEvent";
import { open } from "@tauri-apps/api/dialog";
import { appDir, homeDir } from "@tauri-apps/api/path";
import { ModalButton } from "../../madoc/components/ModalButton";
import { Button } from "../../atoms/Button";
import { NewManifestModal } from "../../components/modals/NewManifestModal";
import { ExportToJson } from "../../components/widgets/ExportToJSON";
import { getCurrent } from "@tauri-apps/api/window";
import { AppMenu } from "./components/AppMenu";
import { useProjectCreators } from "../ProjectContext/ProjectContext.hooks";
import { readTextFile } from "@tauri-apps/api/fs";

export function AppHeaderDesktop() {
  const { current: currentProject, actions } = useProjectContext();
  const [isMenuHidden, setIsMenuHidden] = useLocalStorage("menu-hidden");
  const [editingTitle, setIsEditingTitle] = useState(false);
  const { apps, changeApp } = useApps();
  const [currentMenuItem, setCurrentMenuItem] = useState("");
  const { current } = useProjectContext();
  const { createProjectFromManifestJson } = useProjectCreators();
  const filteredApps = Object.values(apps).filter((app: MappedApp) => {
    if (!currentProject && app.metadata.project) {
      return false;
    }

    if (app.metadata.type === "launcher") {
      return false;
    }

    if (app.metadata.dev && import.meta.env.PROD) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    const current = getCurrent();

    // current.
  }, []);

  useAppWindowEvent<string>("tauri://menu", async (e) => {
    switch (e.payload) {
      case "new": {
        setCurrentMenuItem("new");
        break;
      }
      case "open": {
        const selected = await open({
          directory: false,
          multiple: false,
          title: "Open Manifest JSON",
          defaultPath: await homeDir(),
          filters: [
            {
              name: "IIIF Manifest",
              extensions: ["json"],
            },
          ],
        });

        if (selected) {
          console.log("selected -> ", selected);
          const text = await readTextFile(selected as string);
          console.log("text", text);
          await createProjectFromManifestJson(text);
        }

        break;
      }
      case "open-url": {
        changeApp({ id: "splash" });
        break;
      }
      case "export": {
        setCurrentMenuItem("export");
        break;
      }
    }
  });

  return (
    <Header>
      <Container>
        <AppMenu hideMenu />

        <Logo onClick={() => changeApp({ id: "splash" })}>
          <ManifestEditorLogo height={27} width={200} />
        </Logo>

        <ProjectPreview>
          <DraftTitleEditor />
          {/*<ContextButton>{state.canvasId ? "Canvas" : "Manifest"}</ContextButton>*/}
        </ProjectPreview>

        <PreviewButton />

        {/*<IconButton>•</IconButton>*/}
      </Container>
      {/*
        Modals.
      */}
      {currentMenuItem === "new" ? (
        <ModalButton
          as="div"
          title="New manifest"
          openByDefault
          modalSize="lg"
          onClose={() => setCurrentMenuItem("")}
          render={(props) => <NewManifestModal {...props} />}
        />
      ) : null}
      {currentMenuItem === "export" ? (
        <ModalButton
          as="div"
          openByDefault
          title="Export to JSON"
          modalSize="lg"
          onClose={() => setCurrentMenuItem("")}
          render={(props) => <ExportToJson {...props} />}
        />
      ) : null}
    </Header>
  );
}
