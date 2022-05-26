import {
  ContextButton,
  DraftTitle,
  Draft,
  DraftsText,
  IconButton,
  Logo,
  Container,
  Spacer,
  ProjectPreview,
} from "./AppHeader.styles";
import { useProjectContext } from "../ProjectContext/ProjectContext";
import { useApps, useAppState } from "../AppContext/AppContext";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { useState } from "react";
import { MenuIcon } from "../../icons/MenuIcon";

export function AppHeader() {
  const { current: currentProject } = useProjectContext();
  const { apps, changeApp } = useApps();
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const { current } = useProjectContext();
  const { state } = useAppState();

  return (
    <Container>
      <Dropdown>
        <IconButton
          tabIndex={-1}
          onBlur={() => setTimeout(() => setAppMenuOpen(false), 150)}
          onClick={() => setAppMenuOpen(!appMenuOpen)}
        >
          <MenuIcon />
        </IconButton>
        {appMenuOpen && (
          <DropdownContent>
            {currentProject ? (
              <Button
                onClick={() => {
                  setAppMenuOpen(!appMenuOpen);
                  changeApp({ id: "manifest-editor" });
                }}
                title="Open the Manifest Editor"
                aria-label="Open the manifest editor"
              >
                Manifest Editor
              </Button>
            ) : null}

            {Object.values(apps).map((app) => {
              if (!currentProject && app.metadata.project) {
                return null;
              }

              if (app.metadata.type === "launcher") {
                return null;
              }

              return (
                <Button
                  key={app.metadata.title}
                  onClick={() => {
                    setAppMenuOpen(!appMenuOpen);
                    changeApp({ id: app.metadata.id });
                  }}
                >
                  {app.metadata.title}
                </Button>
              );
            })}
          </DropdownContent>
        )}
      </Dropdown>

      <Logo onClick={() => changeApp({ id: "splash" })}>Manifest editor</Logo>

      <ProjectPreview>
        <Draft>
          {/*<DraftsText>Drafts</DraftsText>*/}
          {current ? <DraftTitle>{current.name}</DraftTitle> : null}
        </Draft>
        {/*<ContextButton>{state.canvasId ? "Canvas" : "Manifest"}</ContextButton>*/}
      </ProjectPreview>

      {/*<IconButton>•</IconButton>*/}
    </Container>
  );
}
