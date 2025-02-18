import { DownloadButton } from "@manifest-editor/components";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { useVault } from "react-iiif-vault";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { useConfig } from "../ConfigContext/ConfigContext";
import { usePreviewContext } from "../PreviewContext/PreviewContext";
import {
  ButtonChange,
  ButtonContainer,
  ButtonEmpty,
  ButtonMain,
  MenuContainer,
  MenuItem,
  MenuItemClose,
  MenuItemLabel,
  MenuItemStatus,
} from "./PreviewButton.styles";

export function PreviewButton({
  downloadEnabled,
  fileName,
}: { downloadEnabled?: boolean; fileName?: string }) {
  const { active, configs, actions, selected } = usePreviewContext();
  const vault = useVault();
  const config = useConfig();
  const resource = useAppResource();
  const configsToShow = configs.filter(
    (c) => c.type === "external-manifest-preview",
  );
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(
    configsToShow.length,
  );

  if (configsToShow.length === 0) {
    return <ButtonEmpty>Preview not available</ButtonEmpty>;
  }

  return (
    <>
      {downloadEnabled ? (
        <div className="mr-4">
          <DownloadButton
            fileName={fileName || "manifest.json"}
            label="Download manifest"
            getData={() => {
              if (config.export && config.export.version === 2) {
                return JSON.stringify(
                  vault.toPresentation2(resource as any),
                  null,
                  2,
                );
              }
              return JSON.stringify(
                vault.toPresentation3(resource as any),
                null,
                2,
              );
            }}
          />
        </div>
      ) : null}
      <ButtonContainer>
        <ButtonMain
          onClick={() => {
            if (!selected) {
              const defaultPreviewId = config.defaultPreview;
              if (defaultPreviewId) {
                const found = configs.find((c) => c.id === defaultPreviewId);
                if (found) {
                  actions.selectPreview(found.id);
                  actions.updatePreviews();
                  return;
                }
              }

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
                <MenuItemStatus
                  $status={
                    inactive
                      ? "available"
                      : config.id === selected
                        ? "active"
                        : "configured"
                  }
                />
                <MenuItemLabel
                  onClick={() => {
                    actions.selectPreview(config.id);
                    actions.updatePreviews();
                  }}
                >
                  {config.label}
                </MenuItemLabel>
                {!inactive ? (
                  <MenuItemClose
                    onClick={() => actions.deletePreview(config.id)}
                  >
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
