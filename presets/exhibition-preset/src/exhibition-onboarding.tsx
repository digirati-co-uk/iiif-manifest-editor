import { DownloadButton, OnboardingTour } from "@manifest-editor/components";
import {
  ButtonChange,
  ButtonContainer,
  ButtonMain,
  MenuContainer,
  MenuItemLabel,
  MenuItemStatus,
  type PresetDefinition,
  type PresetPreviewButtonRenderContext,
  type PresetTemplateDefinition,
  useAppResource,
  useConfig,
  useLayoutActions,
  useOpenPresetOnboarding,
  usePresetTemplateSelection,
  usePreviewContext,
} from "@manifest-editor/shell";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { type SVGProps } from "react";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { useVault } from "react-iiif-vault";
import { getExhibitionTemplatePreviews, useExhibitionTemplate } from "./helpers/exhibition-template";
import { exhibitionTemplates } from "./exhibition-templates";

export { exhibitionTemplates } from "./exhibition-templates";

const exhibitionTemplateShortLabels = {
  fullpage: "Full page",
  slideshow: "Slideshow",
  scroll: "Scroll",
};

export const exhibitionPresetConfig: PresetDefinition = {
  templates: exhibitionTemplates,
  onboarding: {
    id: "exhibition-template-selection",
    mode: "per-resource",
    title: "Choose exhibition format",
    summary: "Pick a starting point for this exhibition.",
    openLabel: "Exhibition formats",
    dismissLabel: "Skip for now",
    primaryLabel: "Start building",
    renderPreviewButton: (props) => <ExhibitionPresetPreviewButton {...props} />,
    renderBody: ({ templates, selectedTemplateId, setSelectedTemplateId, dismiss }) => (
      <div className="grid gap-3 sm:grid-cols-3">
        {templates.length ? (
          templates.map((template) => {
            const selected = selectedTemplateId === template.id;
            const select = () => {
              setSelectedTemplateId(template.id);
              dismiss();
            };
            return (
              <article
                key={template.id}
                className={[
                  "relative overflow-hidden rounded border-2 bg-white",
                  selected ? "border-me-primary-500" : "border-gray-200",
                ].join(" ")}
              >
                <Button
                  aria-label={`Use ${template.label} format`}
                  aria-pressed={selected}
                  className="absolute inset-0 z-10 cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-me-primary-500"
                  onPress={select}
                />
                <img src={template.thumbnailUrl} alt="" className="aspect-video w-full bg-gray-100 object-cover" />
                <div className="pointer-events-none flex flex-col gap-2 p-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{template.label}</h3>
                    <p className="mt-1 text-xs uppercase tracking-normal text-gray-500">{template.type}</p>
                  </div>
                  <p className="text-sm text-gray-600">{template.summary}</p>
                  <a
                    href={template.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto relative z-20 inline-flex w-fit items-center rounded py-0.5 text-sm font-medium text-me-700 hover:text-me-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500 focus-visible:ring-offset-2"
                  >
                    Preview
                  </a>
                </div>
              </article>
            );
          })
        ) : (
          <p className="text-sm text-gray-600">No exhibition formats are available for this editor.</p>
        )}
      </div>
    ),
  },
};

function getTemplatePreviewUrl(previewUrl: string, manifestId: string) {
  const url = new URL(previewUrl);
  url.searchParams.set("manifest", manifestId);
  return url.toString();
}

function ExhibitionPresetPreviewButton({
  downloadEnabled,
  fileName,
  preview,
  showOnboardingPreviewHint,
  onOnboardingPreviewHintClose,
}: PresetPreviewButtonRenderContext) {
  const { actions, configs, active } = usePreviewContext();
  const vault = useVault();
  const config = useConfig();
  const resource = useAppResource();
  const layoutActions = useLayoutActions();
  const openOnboarding = useOpenPresetOnboarding();
  const { selectedTemplate, templates } = usePresetTemplateSelection();
  const configuredTemplate = useExhibitionTemplate();
  const previewConfigs = configs.filter((item) => item.type === "external-manifest-preview");
  const templatePreviews = getExhibitionTemplatePreviews(templates, selectedTemplate, configuredTemplate);
  const currentPreviewConfig =
    previewConfigs.find((item) => item.id === config.defaultPreview) ||
    previewConfigs.find((item) => !item.id.includes("theseus") && item.id !== "raw-manifest") ||
    previewConfigs[0];
  const theseus = previewConfigs.find((item) => item.id === "theseus" || item.id === "theseus-viewer");
  const json = previewConfigs.find((item) => item.id === "raw-manifest");

  async function openPreview(template: PresetTemplateDefinition) {
    const manifestId = await actions.getPreviewLink();
    if (manifestId) {
      window.open(getTemplatePreviewUrl(template.previewUrl, manifestId), template.id);
    }
  }

  function openPreviewFixed(id: string) {
    // if (active.includes(id)) {
    //   actions.focusPreview(id);
    //   return;
    // }
    actions.selectPreview(id);
  }

  function openThemePanel() {
    layoutActions.leftPanel.open({ id: "@exhibitions/theme-panel" });
  }

  if (!templatePreviews.length && !preview?.mainAction && !preview?.actions?.length) {
    return null;
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
      <ButtonContainer style={{ width: "auto", minWidth: "10em" }}>
        <ButtonMain
          as={Button}
          data-preview-action={preview?.mainAction?.id}
          isDisabled={preview?.mainAction?.disabled}
          onPress={preview?.mainAction?.onClick || openThemePanel}
        >
          {preview?.mainAction?.label || "Preview"}
          {configuredTemplate ? (
            <span className="ml-1 whitespace-nowrap opacity-75">
              · {exhibitionTemplateShortLabels[configuredTemplate.type]}
            </span>
          ) : null}
        </ButtonMain>
        <MenuTrigger>
          <ButtonChange
            as={Button}
            $open={false}
            aria-label="Choose preview"
            className="exhibition-preview-preset-menu"
          >
            <DownIcon />
          </ButtonChange>
          <Popover placement="bottom right" className="z-50">
            <MenuContainer
              as={Menu}
              $open
              className="outline-none"
              style={{ position: "relative", top: "auto", left: "auto", marginTop: 0, width: "15em" }}
            >
              <MenuItem
                className="flex cursor-pointer items-center border-b border-gray-100 p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                onAction={openOnboarding}
              >
                <span className="mx-2 flex h-4 w-8 shrink-0 items-center justify-center">
                  <TablerSwitch3 className="h-4 w-4 text-gray-500" />
                </span>
                <MenuItemLabel>Change exhibition format</MenuItemLabel>
              </MenuItem>
              {templatePreviews.map((template) => {
                const isCurrent = configuredTemplate?.id === template.id;
                return (
                  <MenuItem
                    key={template.id}
                    aria-current={isCurrent ? "true" : undefined}
                    className="flex cursor-pointer items-center p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                    onAction={() => openPreview(template)}
                  >
                    <MenuItemStatus $status={isCurrent ? "active" : "available"} />
                    <MenuItemLabel>
                      {template.label}
                      {isCurrent ? " (current)" : ""}
                    </MenuItemLabel>
                  </MenuItem>
                );
              })}
              {preview?.actions?.map((action) => (
                <MenuItem
                  key={action.id}
                  className="flex cursor-pointer items-center p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                  isDisabled={action.disabled}
                  onAction={action.onClick}
                >
                  <MenuItemStatus $status={action.status || "available"} />
                  <MenuItemLabel>{action.label}</MenuItemLabel>
                </MenuItem>
              ))}
              {theseus && theseus.id !== currentPreviewConfig?.id ? (
                <MenuItem
                  className="flex cursor-pointer items-center p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                  onAction={() => openPreviewFixed(theseus.id)}
                >
                  <MenuItemStatus $status={active.includes(theseus.id) ? "configured" : "available"} />
                  <MenuItemLabel>{theseus.label}</MenuItemLabel>
                </MenuItem>
              ) : null}
              {json && json.id !== currentPreviewConfig?.id ? (
                <MenuItem
                  className="flex cursor-pointer items-center p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                  onAction={() => openPreviewFixed(json.id)}
                >
                  <MenuItemStatus $status={active.includes(json.id) ? "configured" : "available"} />
                  <MenuItemLabel>{json.label}</MenuItemLabel>
                </MenuItem>
              ) : null}
            </MenuContainer>
          </Popover>
        </MenuTrigger>
      </ButtonContainer>
      <OnboardingTour
        id="exhibition-preview-preset-menu"
        forceStart={showOnboardingPreviewHint}
        onClose={onOnboardingPreviewHintClose}
        lastButtonLabel="Dismiss"
        steps={[
          {
            target: ".exhibition-preview-preset-menu",
            placement: "bottom",
            disableBeacon: true,
            content: "You can change the exhibition format again from this preview menu.",
          },
        ]}
      />
    </>
  );
}

function TablerSwitch3(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M3 17h2.397a5 5 0 0 0 4.096-2.133l.177-.253m3.66-5.227l.177-.254A5 5 0 0 1 17.603 7H21" />
        <path d="m18 4l3 3l-3 3M3 7h2.397a5 5 0 0 1 4.096 2.133l4.014 5.734A5 5 0 0 0 17.603 17H21" />
        <path d="m18 20l3-3l-3-3" />
      </g>
    </svg>
  );
}
