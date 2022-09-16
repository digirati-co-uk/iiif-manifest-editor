import { IconButton } from "../AppHeader.styles";
import { MenuIcon } from "../../../icons/MenuIcon";
import { Dropdown, DropdownDivider, DropdownLabel, DropdownMenu } from "../../../atoms/Dropdown";
import { Button } from "../../../atoms/Button";
import { useProjectContext } from "../../ProjectContext/ProjectContext";
import { useLocalStorage } from "../../../madoc/use-local-storage";
import { useApps } from "../../AppContext/AppContext";
import { MappedApp } from "../../../apps/app-loader";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";

export function AppMenu(props: { hideMenu?: boolean }) {
  const { current: currentProject } = useProjectContext();
  const [isMenuHidden, setIsMenuHidden] = useLocalStorage("menu-hidden");
  const { apps, changeApp } = useApps();
  const filteredApps = Object.values(apps).filter((app: MappedApp) => {
    if (!currentProject && app.metadata.project) {
      return false;
    }

    if (app.metadata.type === "launcher") {
      return false;
    }

    if (app.metadata.dev && import.meta.env.PROD) {
      // @ts-ignore
      if (global.PULL_REQUEST === "true") {
        return true;
      }

      return false;
    }

    return true;
  });
  const { itemProps, buttonProps, isOpen, setIsOpen } = useDropdownMenu(filteredApps.length + 1);

  return (
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
        {props.hideMenu ? null : (
          <>
            <DropdownLabel>Quick Settings</DropdownLabel>
            <DropdownDivider />
            <Button {...(itemProps[filteredApps.length + 0] as any)} onClick={() => setIsMenuHidden(!isMenuHidden)}>
              {isMenuHidden ? "Show menu" : "Hide menu"}
            </Button>
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
