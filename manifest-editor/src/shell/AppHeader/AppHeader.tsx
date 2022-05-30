import {
  DraftTitle,
  Draft,
  IconButton,
  Logo,
  Container,
  ProjectPreview,
  Header,
  DraftsText,
  DraftTitleEdit,
  DraftTitleEditInput,
  DraftTitleEditButton,
} from "./AppHeader.styles";
import { useProjectContext } from "../ProjectContext/ProjectContext";
import { useApps } from "../AppContext/AppContext";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownDivider, DropdownLabel, DropdownMenu } from "../../atoms/Dropdown";
import { MenuIcon } from "../../icons/MenuIcon";
import { PreviewButton } from "../../components/organisms/PreviewButton/PreviewButton";
import { ShellOptions } from "../../apps/Shell/ShellOptions";
import { ManifestEditorLogo } from "../../atoms/ManifestEditorLogo";
import { MappedApp } from "../../apps/app-loader";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { useLocalStorage } from "../../madoc/use-local-storage";
import { Input } from "../../atoms/Input";
import { FormEvent, useState } from "react";
import { flushSync } from "react-dom";

export function AppHeader() {
  const { current: currentProject, actions } = useProjectContext();
  const [isMenuHidden, setIsMenuHidden] = useLocalStorage("menu-hidden");
  const [editingTitle, setIsEditingTitle] = useState(false);
  const { apps, changeApp } = useApps();
  const { current } = useProjectContext();
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
  const { itemProps, buttonProps, isOpen, setIsOpen } = useDropdownMenu(filteredApps.length + 1);

  return (
    <Header>
      <Container>
        <Dropdown>
          <IconButton {...buttonProps}>
            <MenuIcon />
          </IconButton>
          <DropdownMenu $open={isOpen}>
            <DropdownLabel>Apps</DropdownLabel>
            <DropdownDivider />
            {filteredApps.map((app, key) => (
              <Button
                key={app.metadata.id}
                {...(itemProps[key] as any)}
                onClick={() => {
                  changeApp({ id: app.metadata.id });
                  setIsOpen(false);
                }}
              >
                {app.metadata.title}
              </Button>
            ))}
            <DropdownLabel>Quick Settings</DropdownLabel>
            <DropdownDivider />
            <Button {...(itemProps[filteredApps.length + 0] as any)} onClick={() => setIsMenuHidden(!isMenuHidden)}>
              {isMenuHidden ? "Show menu" : "Hide menu"}
            </Button>
          </DropdownMenu>
        </Dropdown>

        <Logo onClick={() => changeApp({ id: "splash" })}>
          <ManifestEditorLogo height={27} width={200} />
        </Logo>

        <ProjectPreview>
          <Draft>
            <DraftsText>Drafts</DraftsText>
            {current ? (
              <>
                {editingTitle ? (
                  <DraftTitleEdit
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                      const form = new FormData(e.target as any);
                      const data = Object.fromEntries(form.entries());
                      actions.updateDetails(data as any);
                      setIsEditingTitle(false);
                    }}
                  >
                    <DraftTitleEditInput id="project-title" defaultValue={current.name} name="name" />
                    <DraftTitleEditButton>Save</DraftTitleEditButton>
                  </DraftTitleEdit>
                ) : (
                  <DraftTitle
                    onClick={() => {
                      flushSync(() => {
                        setIsEditingTitle(true);
                      });
                      document.getElementById("project-title")?.focus();
                    }}
                  >
                    {current.name || "Untitled project"}
                  </DraftTitle>
                )}
              </>
            ) : null}
          </Draft>
          {/*<ContextButton>{state.canvasId ? "Canvas" : "Manifest"}</ContextButton>*/}
        </ProjectPreview>

        <PreviewButton />

        {/*<IconButton>•</IconButton>*/}
      </Container>
      {!isMenuHidden ? <ShellOptions /> : null}
    </Header>
  );
}
