import { useProjectContext } from "../../../shell/ProjectContext/ProjectContext";
import { usePreviewContext } from "../../../shell/PreviewContext/PreviewContext";
import {
  MenuContainer,
  ButtonContainer,
  ButtonChange,
  ButtonMain,
  MenuItem,
  MenuItemClose,
  MenuItemLabel,
  MenuItemStatus,
  ButtonEmpty,
} from "./PreviewButton.styles";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { DownIcon } from "../../../icons/DownIcon";
import { useApps } from "../../../shell/AppContext/AppContext";
import { CloseIcon } from "../../../madoc/components/icons/CloseIcon";

export function PreviewButton() {
  const { current } = useProjectContext();
  const { currentApp, apps } = useApps();
  const { active, configs, actions, selected } = usePreviewContext();
  const configsToShow = configs.filter((c) => c.type === "external-manifest-preview");
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(configsToShow.length);

  if (!current || currentApp.id === "splash") {
    return null;
  }
  if (configsToShow.length === 0) {
    return <ButtonEmpty>Preview not available</ButtonEmpty>;
  }

  return (
    <ButtonContainer>
      <ButtonMain
        onClick={() => {
          if (!selected) {
            actions.selectPreview(configs[0].id);
          }
          actions.updatePreviews();
        }}
      >
        Preview
      </ButtonMain>
      <ButtonChange $open={isOpen} {...buttonProps}>
        <DownIcon />
      </ButtonChange>

      <MenuContainer $open={isOpen}>
        {configsToShow.map((config, key) => {
          const inactive = active.indexOf(config.id) === -1;
          return (
            <MenuItem key={config.id} {...(itemProps[key] as any)}>
              <MenuItemStatus $status={inactive ? "available" : config.id === selected ? "active" : "configured"} />
              <MenuItemLabel onClick={() => actions.selectPreview(config.id)}>{config.label}</MenuItemLabel>
              {!inactive ? (
                <MenuItemClose onClick={() => actions.deletePreview(config.id)}>
                  <CloseIcon />
                </MenuItemClose>
              ) : null}
            </MenuItem>
          );
        })}
      </MenuContainer>
    </ButtonContainer>
  );
}
