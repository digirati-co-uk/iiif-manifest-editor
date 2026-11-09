import { useEditorI18n, useTranslations, type MessageReference } from "@manifest-editor/i18n";
import { MenuIcon } from "@manifest-editor/ui/icons/MenuIcon";
import { Dropdown, DropdownDivider, DropdownLabel, DropdownMenu } from "@manifest-editor/ui/atoms/Dropdown";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { useLocalStorage } from "@manifest-editor/shell";
import useDropdownMenu from "../use-dropdown-menu";
import { useProjectContext } from "../ProjectContext";
import { MappedApp, useApps } from "@manifest-editor/shell";
import styled from "styled-components";

export const IconButton = styled.button`
  height: 1.75em;
  width: 1.75em;
  background: #e9e9e9;
  border-radius: 3px;
  display: flex;
  text-align: center;
  align-items: center;
  font-size: 1.1em;
  border: none;
  justify-content: center;

  &:focus {
    background: #e94581;
    color: #fff;
    svg {
      fill: #fff;
    }
  }
`;

export function AppMenu(props: { hideMenu?: boolean }) {
  const t = useTranslations("projects");
  const { resolveMessage } = useEditorI18n();
  const { current: currentProject } = useProjectContext();
  const [isMenuHidden, setIsMenuHidden] = useLocalStorage("menu-hidden");
  const { apps, changeApp } = useApps();
  const type = currentProject?.resource.type;
  const filteredApps = Object.values(apps).filter((app: MappedApp) => {
    if (app.metadata.project && app.metadata.projectType !== type) {
      return false;
    }

    if (!currentProject && app.metadata.project) {
      return false;
    }

    if (app.metadata.type === "launcher") {
      return false;
    }

    // @todo ignore
    // if (app.metadata.dev && import.meta.env.PROD) {
    //   try {
    //     if (import.meta.env.PULL_REQUEST === "true") {
    //       return true;
    //     }
    //   } catch (e) {
    //     return false;
    //   }

    //   return false;
    // }

    return true;
  });
  const { itemProps, buttonProps, isOpen, setIsOpen } = useDropdownMenu(filteredApps.length + 1);

  return (
    <Dropdown>
      <IconButton {...buttonProps} aria-label={t("menu.toggle")}>
        <MenuIcon />
      </IconButton>
      <DropdownMenu $open={isOpen}>
        <DropdownLabel>{t("menu.apps")}</DropdownLabel>
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
            {resolveMessage(
              (app.metadata as MappedApp["metadata"] & { titleMessage?: MessageReference }).titleMessage,
              app.metadata.title
            )}
          </Button>
        ))}
        {props.hideMenu ? null : (
          <>
            <DropdownLabel>{t("menu.quickSettings")}</DropdownLabel>
            <DropdownDivider />
            <Button {...(itemProps[filteredApps.length + 0] as any)} onClick={() => setIsMenuHidden(!isMenuHidden)}>
              {t(isMenuHidden ? "menu.show" : "menu.hide")}
            </Button>
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
