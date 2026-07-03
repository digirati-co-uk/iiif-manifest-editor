import { DownloadButton } from "@manifest-editor/components";
import {
  type PresetDefinition,
  type PresetTemplateDefinition,
  ButtonChange,
  ButtonContainer,
  ButtonMain,
  MenuContainer,
  MenuItemLabel,
  MenuItemStatus,
  useAppResource,
  useConfig,
  useLayoutActions,
  useOpenPresetOnboarding,
  usePreviewContext,
} from "@manifest-editor/shell";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import type { SVGProps } from "react";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { useVault } from "react-iiif-vault";

export const exhibitionTemplates: PresetTemplateDefinition[] = [
  {
    id: "exhibition-fullpage",
    label: "Full page exhibition",
    summary: "A guided exhibition layout with full-page scenes and focused narrative steps.",
    type: "fullpage",
    previewUrl: "https://preview.exhibitionviewer.org/preview/exhibition",
    thumbnailUrl: "https://digirati-co-uk.github.io/iiif-manifest-editor/exhibition-fullpage.png",
    configuration: [
      {
        id: "fullTitleBar",
        label: "Show full title bar",
        type: "boolean",
        defaultValue: true,
      },
    ],
  },
  {
    id: "exhibition-slideshow",
    label: "Slideshow",
    summary: "A slide-based exhibition for linear presentations and teaching material.",
    type: "slideshow",
    previewUrl: "https://preview.exhibitionviewer.org/preview/slideshow",
    thumbnailUrl: "https://digirati-co-uk.github.io/iiif-manifest-editor/exhibition-slideshow.png",
    configuration: [
      {
        id: "floating",
        label: "Floating controls",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    id: "exhibition-scroll",
    label: "Scrolling story",
    summary: "A vertical reading experience for essays, object stories, and long-form interpretation.",
    type: "scroll",
    previewUrl: "https://preview.exhibitionviewer.org/preview/scroll",
    thumbnailUrl: "https://digirati-co-uk.github.io/iiif-manifest-editor/exhibition-scroll.png",
    configuration: [
      {
        id: "theme",
        label: "Theme",
        type: "select",
        defaultValue: "light",
        options: [
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
        ],
      },
    ],
  },
];

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
    renderBody: ({ templates, selectedTemplateId, setSelectedTemplateId }) => (
      <div className="grid gap-3 sm:grid-cols-3">
        {templates.map((template) => {
          const selected = selectedTemplateId === template.id;
          return (
            <article
              key={template.id}
              className={[
                "cursor-pointer overflow-hidden rounded border bg-white outline-none",
                selected ? "border-me-primary-500 ring-2 ring-me-primary-100" : "border-gray-200",
              ].join(" ")}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => setSelectedTemplateId(template.id)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedTemplateId(template.id);
                }
              }}
            >
              <img src={template.thumbnailUrl} alt="" className="aspect-video w-full bg-gray-100 object-cover" />
              <div className="flex flex-col gap-2 p-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{template.label}</h3>
                  <p className="mt-1 text-xs uppercase tracking-normal text-gray-500">{template.type}</p>
                </div>
                <p className="text-sm text-gray-600">{template.summary}</p>
                <a
                  href={template.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-me-700 hover:text-me-900"
                  onClick={(event) => event.stopPropagation()}
                >
                  Preview
                </a>
              </div>
            </article>
          );
        })}
      </div>
    ),
  },
};

function ExhibitionPresetPreviewButton({
  downloadEnabled,
  fileName,
}: {
  downloadEnabled?: boolean;
  fileName?: string;
}) {
  const { active, actions, configs } = usePreviewContext();
  const vault = useVault();
  const config = useConfig();
  const resource = useAppResource();
  const layoutActions = useLayoutActions();
  const openOnboarding = useOpenPresetOnboarding();
  const previewConfigs = configs.filter((item) => item.type === "external-manifest-preview");
  const current =
    previewConfigs.find((item) => item.id === config.defaultPreview) ||
    previewConfigs.find((item) => !item.id.includes("theseus") && item.id !== "raw-manifest") ||
    previewConfigs[0];
  const theseus = previewConfigs.find((item) => item.id === "theseus" || item.id === "theseus-viewer");

  function openPreview(id: string) {
    if (active.includes(id)) {
      actions.focusPreview(id);
      return;
    }
    actions.selectPreview(id);
  }

  function openThemePanel() {
    layoutActions.leftPanel.open({ id: "@exhibitions/theme-panel" });
  }

  if (!current) {
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
      <ButtonContainer>
        <ButtonMain as={Button} onPress={openThemePanel}>
          Preview
        </ButtonMain>
        <MenuTrigger>
          <ButtonChange as={Button} $open={false} aria-label="Choose preview">
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
                className="flex cursor-pointer items-center p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                onAction={() => openPreview(current.id)}
              >
                <MenuItemStatus $status={active.includes(current.id) ? "configured" : "available"} />
                <MenuItemLabel>{current.label}</MenuItemLabel>
              </MenuItem>
              {theseus && theseus.id !== current.id ? (
                <MenuItem
                  className="flex cursor-pointer items-center p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                  onAction={() => openPreview(theseus.id)}
                >
                  <MenuItemStatus $status={active.includes(theseus.id) ? "configured" : "available"} />
                  <MenuItemLabel>{theseus.label}</MenuItemLabel>
                </MenuItem>
              ) : null}
              <MenuItem
                className="flex cursor-pointer items-center border-t border-gray-100 p-1 outline-none hover:bg-gray-50 focus:bg-gray-50"
                onAction={openOnboarding}
              >
                <span className="mx-2 flex h-4 w-6 shrink-0 items-center justify-center">
                  <TablerSwitch3 className="h-4 w-4 text-gray-500" />
                </span>
                <MenuItemLabel>Change preset</MenuItemLabel>
              </MenuItem>
            </MenuContainer>
          </Popover>
        </MenuTrigger>
      </ButtonContainer>
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
