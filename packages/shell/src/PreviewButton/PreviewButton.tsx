import { usePreviewContext } from "../PreviewContext/PreviewContext";
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
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { useAppInstance } from "../AppContext/AppContext";
import { createDownload } from "../helpers";
import { useVault } from "react-iiif-vault";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { DownloadButton } from "@manifest-editor/components";

export function PreviewButton({ downloadEnabled }: { downloadEnabled?: boolean }) {
  const { active, configs, actions, selected } = usePreviewContext();
  const vault = useVault();
  const resource = useAppResource();
  const configsToShow = configs.filter((c) => c.type === "external-manifest-preview");
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(configsToShow.length);

  if (configsToShow.length === 0) {
    return <ButtonEmpty>Preview not available</ButtonEmpty>;
  }

  return (
    <>
      {downloadEnabled ? (
        <div className="mr-4">
          <DownloadButton
            fileName="manifest.json"
            label="Download manifest"
            getData={() => JSON.stringify(vault.toPresentation3(resource as any), null, 2)}
          />
        </div>
      ) : null}
      <ButtonContainer>
        <ButtonMain
          onClick={() => {
            if (!selected) {
              actions.selectPreview(configs[0]!.id);
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
    </>
  );
}
