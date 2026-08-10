import { DownloadButton } from "@manifest-editor/components";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { useVault } from "react-iiif-vault";
import type { PresetPreviewOptions } from "../AppContext/AppContext";
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

export function hasPreviewOption(
  configCount: number,
  preview?: PresetPreviewOptions,
) {
  return configCount > 0 || !!preview?.mainAction || !!preview?.actions?.length;
}

export function PreviewButton({
  downloadEnabled,
  fileName,
  preview,
}: {
  downloadEnabled?: boolean;
  fileName?: string;
  preview?: PresetPreviewOptions;
}) {
  const { active, configs, actions, selected } = usePreviewContext();
  const vault = useVault();
  const config = useConfig();
  const resource = useAppResource();
  const configsToShow = configs.filter((c) => c.type === "external-manifest-preview");
  const customActions = preview?.actions || [];
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(
    configsToShow.length + customActions.length,
  );

  if (!hasPreviewOption(configsToShow.length, preview)) {
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
                return JSON.stringify(vault.toPresentation2(resource as any), null, 2);
              }
              return JSON.stringify(vault.toPresentation3(resource as any), null, 2);
            }}
          />
        </div>
      ) : null}
      <ButtonContainer>
        <ButtonMain
          data-preview-action={preview?.mainAction?.id}
          disabled={
            preview?.mainAction?.disabled ||
            (!preview?.mainAction && configsToShow.length === 0)
          }
          onClick={() => {
            if (preview?.mainAction) {
              preview.mainAction.onClick();
              return;
            }
            if (!configsToShow.length) return;
            if (!selected) {
              const defaultPreviewId = config.defaultPreview;
              if (defaultPreviewId) {
                const found = configs.find((c) => c.id === defaultPreviewId);
                if (found) {
                  actions.selectPreview(found.id);
                  return;
                }
              }

              actions.selectPreview(configs[0]!.id);
            }
            actions.updatePreviews();
          }}
        >
          {preview?.mainAction?.label || "Preview"}
        </ButtonMain>
        {configsToShow.length + customActions.length > 0 ? (
          <ButtonChange $open={isOpen} {...buttonProps} aria-label="Choose preview">
            <DownIcon aria-hidden />
          </ButtonChange>
        ) : null}

        <MenuContainer $open={isOpen} role="menu">
          {configsToShow.map((config, key) => {
            const inactive = active.indexOf(config.id) === -1;
            return (
              <MenuItem key={config.id} {...(itemProps[key] as any)}>
                <MenuItemStatus $status={inactive ? "available" : config.id === selected ? "active" : "configured"} />
                <MenuItemLabel
                  onClick={() => {
                    actions.selectPreview(config.id);
                  }}
                >
                  {config.label}
                </MenuItemLabel>
                {!inactive ? (
                  <MenuItemClose onClick={() => actions.deletePreview(config.id)}>
                    <CloseIcon />
                  </MenuItemClose>
                ) : null}
              </MenuItem>
            );
          })}
          {customActions.map((action, key) => (
            <MenuItem
              key={action.id}
              {...(itemProps[configsToShow.length + key] as any)}
              aria-disabled={action.disabled || undefined}
              onClick={() => {
                if (!action.disabled) action.onClick();
              }}
            >
              <MenuItemStatus $status={action.status || "available"} />
              <MenuItemLabel>{action.label}</MenuItemLabel>
            </MenuItem>
          ))}
        </MenuContainer>
      </ButtonContainer>
    </>
  );
}
