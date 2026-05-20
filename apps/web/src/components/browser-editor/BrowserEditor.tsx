"use client";

import { createThumbnailHelper } from "@iiif/helpers";
import {
  ActionButton,
  DefaultTooltipContent,
  Form,
  ManifestEditorLogo,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tooltip,
  TooltipTrigger,
} from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { PresetIcon } from "@manifest-editor/exhibition-preset";
import DarkIcon from "@manifest-editor/ui/icons/DarkIcon";
import LightIcon from "@manifest-editor/ui/icons/LightIcon";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import * as collectionEditorPreset from "@manifest-editor/manifest-preset";
import {
  type AnnotationPanel,
  AppProvider,
  BackgroundActionsMenu,
  type CanvasEditorDefinition,
  type Config,
  ConfigEditor,
  type EditorDefinition,
  extendApp,
  Layout,
  type LayoutPanel,
  type MappedApp,
  type MappedPlugin,
  mapApp,
  mergePartialConfig,
  type PluginModule,
  PluginProvider,
  PreviewButton,
  type PreviewConfiguration,
  ShellProvider,
  useAppResource,
  useEditingResource,
  useLayoutActions,
  useLayoutState,
  usePreviewContext,
  useSaveVault,
} from "@manifest-editor/shell";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { VaultProvider } from "react-iiif-vault";
import {
  useBrowserGlobalPluginConfig,
  useBrowserProject,
} from "./browser-state";

import { MaybeExhibitionPrompt } from "./MaybeExhibitionPrompt";

const previews: PreviewConfiguration[] = [
  {
    id: "theseus",
    type: "external-manifest-preview",
    label: "Theseus",
    config: {
      url: "https://theseusviewer.org/?iiif-content={manifestId}&ref=manifest-editor",
    },
  },
  {
    id: "universal-viewer",
    type: "external-manifest-preview",
    label: "Universal viewer",
    config: {
      url: "https://universalviewer.dev/#?iiifManifestId={manifestId}",
    },
  },
  {
    id: "mirador-3",
    type: "external-manifest-preview",
    label: "Mirador 3",
    config: {
      url: "https://projectmirador.org/embed/?iiif-content={manifestId}",
    },
  },
  {
    id: "annona",
    type: "external-manifest-preview",
    label: "Annona",
    config: {
      url: "https://ncsu-libraries.github.io/annona/tools/#/display?url={manifestId}&viewtype=iiif-storyboard&settings=%7B%22fullpage%22%3Atrue%7D",
    },
  },
  {
    id: "clover",
    type: "external-manifest-preview",
    label: "Clover",
    config: {
      url: "https://samvera-labs.github.io/clover-iiif/docs/viewer/demo?iiif-content={manifestId}",
    },
  },
  {
    id: "iiif-preview",
    type: "iiif-preview-service",
    label: "IIIF Preview",
    config: {
      url: "/api/iiif/store",
    },
  },
  {
    id: "raw-manifest",
    type: "external-manifest-preview",
    label: "Raw Manifest",
    config: {
      url: "{manifestId}",
    },
  },
];

const config: Partial<Config> = {
  previews,
  // editorConfig: {
  //   Manifest: {
  //     singleTab: "@manifest-editor/overview",
  //     // onlyTabs: [
  //     //   //
  //     //   "@manifest-editor/overview",
  //     //   "@manifest-editor/metadata",
  //     // ],
  //     fields: ["label", "summary", "metadata"],
  //   },
  // },
};

export interface BrowserEditorProps {
  id: string;
  preset: MappedApp;
  presetPath?: string;
  presetName?: string;
  layoutMode?: "default" | "focused";
  config?: Partial<Config>;
  plugins?: Array<PluginModule | MappedPlugin>;
}

type ExhibitionTheme = "light" | "dark";
type ExhibitionPresetViewerSettings = {
  defaultPreview?: "delft-slideshow" | "minimal-slideshow" | "minimal-floating-tour";
  floatingPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

const exhibitionThemeStorageKey = "exhibition-editor-theme";
const exhibitionViewerPluginId = "exhibition-viewer";
const exhibitionViewerSettingsKey = "preset";
const defaultExhibitionViewerSettings: Required<ExhibitionPresetViewerSettings> = {
  defaultPreview: "delft-slideshow",
  floatingPosition: "top-right",
};

const exhibitionHeaderStyles = {
  light: "bg-[#26212a]",
  dark: "bg-[#18161d]",
} satisfies Record<ExhibitionTheme, string>;

function getExhibitionViewerSettings(config?: Partial<Config> | null): Required<ExhibitionPresetViewerSettings> {
  const rawSettings =
    config?.plugins?.apps?.[exhibitionViewerPluginId]?.settings?.[exhibitionViewerSettingsKey] || {};

  return {
    ...defaultExhibitionViewerSettings,
    ...(rawSettings as ExhibitionPresetViewerSettings),
  };
}

function createFloatingTourUrl(floatingPosition: ExhibitionPresetViewerSettings["floatingPosition"]) {
  const url = new URL("https://preview.exhibitionviewer.org/preview/slideshow");
  url.searchParams.set("manifest", "{manifestId}");
  url.searchParams.set("minimal", "true");
  url.searchParams.set("floating", "true");
  url.searchParams.set("floating-position", floatingPosition || defaultExhibitionViewerSettings.floatingPosition);
  return url.toString().replace("%7BmanifestId%7D", "{manifestId}");
}

function applyExhibitionViewerSettings(
  baseConfig: Partial<Config>,
  presetPath: string | undefined,
  settings: Required<ExhibitionPresetViewerSettings>,
): Partial<Config> {
  if (presetPath !== "exhibition/slideshow") {
    return baseConfig;
  }

  const floatingTourPreview: PreviewConfiguration = {
    id: "minimal-floating-tour",
    type: "external-manifest-preview",
    label: "Floating tour",
    config: {
      url: createFloatingTourUrl(settings.floatingPosition),
    },
  };
  const previews = baseConfig.previews || [];
  const hasFloatingTourPreview = previews.some((preview) => preview.id === floatingTourPreview.id);

  return {
    ...baseConfig,
    defaultPreview: settings.defaultPreview,
    previews: (hasFloatingTourPreview ? previews : [...previews, floatingTourPreview]).map((preview) => {
      if (preview.id !== floatingTourPreview.id) {
        return preview;
      }

      return floatingTourPreview;
    }),
  };
}

function getInitialExhibitionTheme(): ExhibitionTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem(exhibitionThemeStorageKey) === "dark"
    ? "dark"
    : "light";
}

function getNextExhibitionTheme(theme: ExhibitionTheme): ExhibitionTheme {
  return theme === "dark" ? "light" : "dark";
}

export default function BrowserEditor({
  id,
  config: browserConfig,
  preset,
  presetPath,
  presetName,
  layoutMode,
  plugins = [],
}: BrowserEditorProps) {
  const {
    staleEtag,
    vaultReady,
    project,
    projectError,
    closeProject,
    isProjectError,
    isProjectLoading,
    reopenProject,
    saveExtraData,
    saveResource,
    saveVaultData,
    userForceUpdate,
    vault,
    wasAlreadyOpen,
    projectConfig,
    saveProjectConfig,
  } = useBrowserProject(id);
  const {
    globalPluginConfig,
    isGlobalPluginConfigLoading,
    saveGlobalPluginConfig,
  } = useBrowserGlobalPluginConfig();
  const [allowAnyway, setAllowAnyway] = useState(false);
  const isExhibitionPreset = presetPath?.startsWith("exhibition") || false;
  const isFocusedExhibition = layoutMode === "focused" && isExhibitionPreset;
  const exhibitionViewerSettings = useMemo(() => {
    return getExhibitionViewerSettings(projectConfig);
  }, [projectConfig]);
  const customConfig = useMemo(() => {
    return applyExhibitionViewerSettings(browserConfig || {}, presetPath, exhibitionViewerSettings);
  }, [browserConfig, exhibitionViewerSettings, presetPath]);
  const [exhibitionTheme, setExhibitionTheme] = useState<ExhibitionTheme>(
    getInitialExhibitionTheme,
  );
  const thumbnailHelper = useMemo(() => {
    return createThumbnailHelper(vault);
  }, [vault]);

  useEffect(() => {
    if (isFocusedExhibition) {
      window.localStorage.setItem(exhibitionThemeStorageKey, exhibitionTheme);
    }
  }, [exhibitionTheme, isFocusedExhibition]);

  const toggleExhibitionTheme = useCallback(() => {
    setExhibitionTheme(getNextExhibitionTheme);
  }, []);

  const searchParams = useSearchParams();

  const selectedCanvasId = searchParams.get("selected-canvas-id") || undefined;
  const selectedId = searchParams.get("selected-id");
  const selectedType = searchParams.get("selected-type");
  const editing =
    selectedId && selectedType
      ? { id: selectedId, type: selectedType }
      : undefined;
  const selectedTab = searchParams.get("selected-tab") || undefined;

  useLayoutEffect(() => {
    if (project?.isOpen) {
      posthog.capture("manifest-edited", {
        resource_id: project.resource.id,
        resource_type: project.resource.type,
      });
    }
  }, [project?.isOpen]);

  const saveVault = useCallback(async () => {
    if (project) {
      const fullResource = vault.get(project.resource);
      if (!fullResource) return;
      const thumbnail = await thumbnailHelper.getBestThumbnailAtSize(
        fullResource,
        { width: 256, height: 256 },
        false,
      );
      const resource = {
        ...project.resource,
        label: fullResource.label,
        thumbnail: thumbnail?.best?.id || "",
      };
      await saveVaultData.mutateAsync({ force: false, resource });
    }
  }, [project, vault]);

  useSaveVault(
    vault,
    saveVault,
    5000,
    vaultReady && !!project && (!wasAlreadyOpen || allowAnyway),
  );

  useEffect(() => {
    if (wasAlreadyOpen && !allowAnyway) {
      userForceUpdate.mutateAsync().then(() => setAllowAnyway(true));
    }
  }, [wasAlreadyOpen, allowAnyway]);

  useEffect(() => {
    if (staleEtag) {
      reopenProject();
    }
  }, [staleEtag]);

  const mergedConfig = useMemo(() => {
    return mergePartialConfig(config, projectConfig, customConfig);
  }, [projectConfig, customConfig]);

  const manifestEditor = useMemo(() => {
    return extendApp(preset, preset.metadata, {
      leftPanels: [
        {
          divide: true,
          id: "config",
          label: "Config",
          icon: <SettingsIcon />,
          render: () => <ConfigEditor />,
        },
        ...(isExhibitionPreset
          ? [
              {
                divide: true,
                id: "exhibition-preset-config",
                label: "Preset",
                icon: <PresetIcon />,
                render: () => (
                  <ExhibitionPresetConfigEditor
                    projectId={id}
                    layoutMode={layoutMode}
                    layoutPreset={presetPath}
                    settings={exhibitionViewerSettings}
                    saveConfig={saveProjectConfig}
                  />
                ),
              } satisfies LayoutPanel,
            ]
          : []),
      ],
      modalPanels: [
        {
          id: "share-modal",
          icon: <ShareIcon />,
          label: "Share workspace",
          render: () => <SharePanel projectId={id} presetPath={presetPath} />,
        },
      ],
    });
  }, [exhibitionViewerSettings, isExhibitionPreset, presetPath, project, saveProjectConfig]);

  const header = (
    <>
      <header
        className={
          isFocusedExhibition
            ? `h-[64px] flex w-full gap-12 px-6 items-center border-b border-white/10 ${exhibitionHeaderStyles[exhibitionTheme]} text-white`
            : "h-[64px] flex w-full gap-12 px-4 items-center shadow"
        }
      >
        <Link href="/" className="flex justify-start items-center gap-2">
          {isFocusedExhibition ? (
            <span className="text-xl font-bold tracking-normal text-white">
              Exhibition Editor
            </span>
          ) : (
            <>
              <ManifestEditorLogo />
              {presetName ? (
                <span className="text-lg text-gray-600">/ {presetName}</span>
              ) : null}
            </>
          )}
        </Link>
        <div className="flex-1" />
        <div className="flex items-center justify-center gap-5">
          {/* Github links etc. */}
          {/* <GlobalNav noMenu /> */}
          <div className="flex items-center gap-2">
            <ShareButton />
            <BackgroundActionsMenu />
            {isFocusedExhibition ? (
              <button
                type="button"
                className="h-9 rounded-md border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                aria-pressed={exhibitionTheme === "dark"}
                aria-label={`Switch to ${exhibitionTheme === "dark" ? "light" : "dark"} mode`}
                onClick={toggleExhibitionTheme}
              >
                {exhibitionTheme === "dark" ? <LightIcon /> : <DarkIcon />}
              </button>
            ) : null}
            <PreviewButton
              downloadEnabled
              fileName={project?.extraData.fileName}
            />
          </div>
        </div>
      </header>
      <MaybeExhibitionPrompt
        id={id}
        alreadyExhibition={isExhibitionPreset}
      />
    </>
  );

  if (isProjectLoading || isGlobalPluginConfigLoading)
    return <div>Loading...</div>;
  if (isProjectError || !project)
    return <div>Error: {projectError?.message}</div>;

  // @todo test without this option and see if its needed
  if (wasAlreadyOpen && !allowAnyway) {
    //   return (
    //     <div>
    //       Already open in another window.
    //       <button
    //         onClick={() => {
    //           userForceUpdate.mutateAsync().then(() => setAllowAnyway(true));
    //         }}
    //       >
    //         Edit anyway
    //       </button>
    //     </div>
    //   );
    return null;
  }

  if (staleEtag) {
    // return (
    //   <div>
    //     Editing in another window
    //     <button
    //       onClick={() => {
    //         reopenProject();
    //       }}
    //     >
    //       Open here
    //     </button>
    //   </div>
    // );
    return null;
  }

  return (
    <div
      className="flex flex-1 h-[100vh] w-full"
      data-exhibition-theme={isFocusedExhibition ? exhibitionTheme : undefined}
    >
      <VaultProvider vault={vault}>
        <PluginProvider
          plugins={plugins}
          globalPluginConfig={globalPluginConfig}
          saveGlobalPluginConfig={saveGlobalPluginConfig}
        >
          <AppProvider
            appId="manifest-editor"
            definition={manifestEditor}
            instanceId={id}
          >
            <VaultProvider vault={vault}>
              <ShellProvider
                resource={project.resource}
                config={mergedConfig}
                saveConfig={saveProjectConfig}
              >
                <Layout
                  key={
                    isFocusedExhibition
                      ? `focused-exhibition-${exhibitionTheme}`
                      : "editor-layout"
                  }
                  header={header}
                  layoutMode={layoutMode}
                  className={
                    isFocusedExhibition ? "exhibition-focused" : undefined
                  }
                />
                <FromQueryString
                  editing={editing}
                  selectedTab={selectedTab}
                  canvasId={selectedCanvasId}
                />
              </ShellProvider>
            </VaultProvider>
          </AppProvider>
        </PluginProvider>
      </VaultProvider>
    </div>
  );
}

function ExhibitionPresetConfigEditor({
  projectId,
  layoutMode,
  layoutPreset,
  settings,
  saveConfig,
}: {
  projectId: string;
  layoutMode?: "default" | "focused";
  layoutPreset?: string;
  settings: Required<ExhibitionPresetViewerSettings>;
  saveConfig: (config: Partial<Config>) => void | Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const isSlideshow = layoutPreset === "exhibition/slideshow";
  const editorBasePath =
    layoutMode === "focused"
      ? `/editor-focused/${projectId}/exhibition`
      : `/editor/${projectId}/exhibition`;

  const saveSettings = useCallback(
    async (nextSettings: Required<ExhibitionPresetViewerSettings>) => {
      setIsSaving(true);
      try {
        await saveConfig({
          defaultPreview: nextSettings.defaultPreview,
          plugins: {
            apps: {
              [exhibitionViewerPluginId]: {
                settings: {
                  [exhibitionViewerSettingsKey]: nextSettings,
                },
              },
            },
          },
        });
      } finally {
        setIsSaving(false);
      }
    },
    [saveConfig],
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formValues = new FormData(e.currentTarget);
    saveSettings({
      defaultPreview: (formValues.get("defaultPreview") ||
        defaultExhibitionViewerSettings.defaultPreview) as Required<ExhibitionPresetViewerSettings>["defaultPreview"],
      floatingPosition: (formValues.get("floatingPosition") ||
        defaultExhibitionViewerSettings.floatingPosition) as Required<ExhibitionPresetViewerSettings>["floatingPosition"],
    });
  }

  return (
    <Sidebar>
      <SidebarHeader title="Preset configuration" />
      <SidebarContent className="p-4">
        <div className="mb-6">
          <div className="mb-3 text-sm font-semibold text-gray-700">
            Layout preset
          </div>
          <div className="flex flex-col gap-2">
            <PresetLayoutLink
              href={editorBasePath}
              label="Full page exhibition"
              selected={layoutPreset === "exhibition"}
            />
            <PresetLayoutLink
              href={`${editorBasePath}/slideshow`}
              label="Slideshow exhibition"
              selected={layoutPreset === "exhibition/slideshow"}
            />
            <PresetLayoutLink
              href={`${editorBasePath}/scroll`}
              label="Scrolling exhibition"
              selected={layoutPreset === "exhibition/scroll"}
            />
          </div>
        </div>

        {isSlideshow ? (
          <Form.Form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Form.InputContainer>
              <Form.Label htmlFor="delft-slideshow">Default preview</Form.Label>
              <div className="flex flex-col gap-3">
                <Form.InputContainer horizontal>
                  <Form.Input
                    type="radio"
                    id="delft-slideshow"
                    name="defaultPreview"
                    value="delft-slideshow"
                    defaultChecked={settings.defaultPreview === "delft-slideshow"}
                  />
                  <label htmlFor="delft-slideshow">Delft slideshow</label>
                </Form.InputContainer>
                <Form.InputContainer horizontal>
                  <Form.Input
                    type="radio"
                    id="minimal-slideshow"
                    name="defaultPreview"
                    value="minimal-slideshow"
                    defaultChecked={settings.defaultPreview === "minimal-slideshow"}
                  />
                  <label htmlFor="minimal-slideshow">Light slideshow</label>
                </Form.InputContainer>
                <Form.InputContainer horizontal>
                  <Form.Input
                    type="radio"
                    id="minimal-floating-tour"
                    name="defaultPreview"
                    value="minimal-floating-tour"
                    defaultChecked={settings.defaultPreview === "minimal-floating-tour"}
                  />
                  <label htmlFor="minimal-floating-tour">Floating tour</label>
                </Form.InputContainer>
              </div>
            </Form.InputContainer>

            <Form.InputContainer>
              <Form.Label htmlFor="floatingPosition">Floating tour position</Form.Label>
              <select
                id="floatingPosition"
                name="floatingPosition"
                defaultValue={settings.floatingPosition}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="top-left">Top left</option>
                <option value="top-right">Top right</option>
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-right">Bottom right</option>
              </select>
            </Form.InputContainer>

            <div>
              <ActionButton type="submit" isDisabled={isSaving}>
                {isSaving ? "Saving..." : "Save preset"}
              </ActionButton>
            </div>
          </Form.Form>
        ) : (
          <div className="text-sm text-gray-600">
            There are no additional supported preset options for this layout yet.
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function PresetLayoutLink({
  href,
  label,
  selected,
  disabled,
}: {
  href?: string;
  label: string;
  selected: boolean;
  disabled?: boolean;
}) {
  const className = [
    "flex items-center justify-between rounded-md border px-3 py-2 text-sm font-medium",
    selected
      ? "border-me-primary-500 bg-me-50 text-me-primary-700"
      : "border-gray-200 bg-white text-gray-700",
    disabled ? "cursor-not-allowed opacity-50" : "hover:border-me-primary-300",
  ].join(" ");

  const content = (
    <>
      <span>{label}</span>
      <span className="text-xs font-semibold">
        {selected ? "Current" : disabled ? "Coming soon" : "Open"}
      </span>
    </>
  );

  if (disabled || !href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function FromQueryString({
  editing,
  selectedTab,
  canvasId,
}: {
  editing?: { id: string; type: string };
  selectedTab?: string;
  canvasId?: string;
}) {
  const { edit, open } = useLayoutActions();

  useEffect(() => {
    if (canvasId) {
      edit({ id: canvasId, type: "Canvas" });
      open({ id: "current-canvas" });
      open({ id: "canvas-listing", state: { gridView: true } });
    }
    if (editing) {
      edit(editing);
      if (editing.type === "Canvas") {
        open({ id: "current-canvas" });
        open({ id: "canvas-listing", state: { gridView: true } });
      }
    }
    if (selectedTab) {
      open("@manifest-editor/editor", { currentTab: selectedTab });
    }
  }, []);

  return null;
}

function ShareButton() {
  const { modal } = useLayoutActions();

  return (
    <Tooltip placement="bottom">
      <TooltipTrigger
        className="bg-me-gray-100 hover:bg-me-primary-500 hover:text-white p-1 rounded-md text-me-primary-500 text-2xl"
        aria-label="Share workspace"
        id="share-modal"
        onPress={() => modal.open({ id: "share-modal" })}
      >
        <ShareIcon aria-labelledby="share-modal" />
        <DefaultTooltipContent>Share workspace</DefaultTooltipContent>
      </TooltipTrigger>
    </Tooltip>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 -960 960 960"
      {...props}
    >
      <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
    </svg>
  );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="#5f6368"
      viewBox="0 -960 960 960"
      {...props}
    >
      <path
        d="M720-80q-50 0-85-35t-35-85q0-7 1-14.5t3-13.5L322-392q-17 15-38 23.5t-44 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q23 0 44 8.5t38 23.5l282-164q-2-6-3-13.5t-1-14.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-23 0-44-8.5T638-672L356-508q2 6 3 13.5t1 14.5q0 7-1 14.5t-3 13.5l282 164q17-15 38-23.5t44-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-640q17 0 28.5-11.5T760-760q0-17-11.5-28.5T720-800q-17 0-28.5 11.5T680-760q0 17 11.5 28.5T720-720ZM240-440q17 0 28.5-11.5T280-480q0-17-11.5-28.5T240-520q-17 0-28.5 11.5T200-480q0 17 11.5 28.5T240-440Zm480 280q17 0 28.5-11.5T760-200q0-17-11.5-28.5T720-240q-17 0-28.5 11.5T680-200q0 17 11.5 28.5T720-160Zm0-600ZM240-480Zm480 280Z"
        fill="currentColor"
      />
    </svg>
  );
}

function createShareLink({
  action,
  manifest,
  projectId,
  selected,
  canvasId,
  tab,
  presetPath,
  resourceType,
}: {
  manifest: string;
  action: "preview" | "import";
  projectId?: string;
  tab?: string;
  resourceType?: string;
  canvasId?: string;
  presetPath?: string;
  selected?: { id: string; type: string };
}) {
  const currentUrl = new URL(window.location.href);
  const baseUrl = new URL(currentUrl.origin);

  baseUrl.pathname = "/share";

  baseUrl.searchParams.set("action", action);

  if (resourceType) {
    baseUrl.searchParams.set("resource-type", resourceType);
  }

  if (projectId) {
    baseUrl.searchParams.set("projectId", projectId);
  }

  if (presetPath) {
    baseUrl.searchParams.set("preset", presetPath);
  }

  baseUrl.searchParams.set("iiif-content", manifest);

  if (canvasId) {
    baseUrl.searchParams.set("selected-canvas-id", canvasId);
  }

  if (tab) {
    baseUrl.searchParams.set("selected-tab", tab);
  }

  if (selected) {
    baseUrl.searchParams.set("selected-id", selected.id);
    baseUrl.searchParams.set("selected-type", selected.type);
  }

  return baseUrl.toString();
}

function SharePanel({
  projectId,
  presetPath,
}: {
  projectId: string;
  presetPath?: string;
}) {
  const { actions } = usePreviewContext();
  const resource = useEditingResource();
  const appResource = useAppResource();
  const { rightPanel } = useLayoutState();
  const canvas = useInStack("Canvas");

  const [options, setOptions] = useState({
    includeCurrentSelectedItem: true,
    includeCurrentTab: true,
  });

  const { includeCurrentSelectedItem, includeCurrentTab } = options;

  const selected = resource ? resource.resource.source : undefined;
  const currentTab =
    rightPanel.current === "@manifest-editor/editor"
      ? rightPanel.state.currentTab
      : undefined;

  const { data } = useQuery({
    queryKey: ["share", { projectId }],
    queryFn: async () => {
      return await actions.getPreviewLink();
    },
  });

  // const form = (
  //   <div className="flex-1 flex gap-1 flex-col">
  //     <div className="flex gap-2 p-2 has-[:checked]:text-me-primary-500 rounded">
  //       <input
  //         type="checkbox"
  //         id="includeCurrentSelectedItem"
  //         value="includeCurrentSelectedItem"
  //         checked={includeCurrentSelectedItem}
  //         onChange={(e) => setOptions({ ...options, includeCurrentSelectedItem: e.target.checked })}
  //       />
  //       <Label htmlFor="includeCurrentSelectedItem">Share current selected item</Label>
  //     </div>
  //     <div className="flex gap-2 p-2 has-[:checked]:text-me-primary-500 rounded">
  //       <input
  //         type="checkbox"
  //         id="includeCurrentTab"
  //         value="includeCurrentTab"
  //         checked={includeCurrentTab}
  //         onChange={(e) => setOptions({ ...options, includeCurrentTab: e.target.checked })}
  //       />
  //       <Label htmlFor="includeCurrentTab">Include selected right panel tab</Label>
  //     </div>
  //   </div>
  // );

  const renderLink = (link: string) =>
    link ? (
      <div>
        <div className="flex gap-2 my-4">
          <input
            className="flex-1 p-2 border-b bg-gray-50"
            type="text"
            value={link}
            readOnly
          />
          <button
            className="bg-me-primary-500 text-white px-5 rounded-md"
            onClick={() => {
              navigator.clipboard.writeText(link);
            }}
          >
            Copy
          </button>
        </div>
      </div>
    ) : (
      <div>Loading...</div>
    );

  return (
    <div className="min-h-64 px-4">
      <p className="mb-8">
        Share your workspace link with a colleague, enabling them to preview it,
        make a copy, or import any changes to continue collaborating on this
        manifest
      </p>
      {renderLink(
        data
          ? createShareLink({
              manifest: data,
              resourceType: appResource.type, //<-- change.
              action: "preview",
              selected: includeCurrentSelectedItem ? selected : undefined,
              tab: includeCurrentTab ? currentTab : undefined,
              presetPath,
              canvasId:
                canvas && selected && selected.type !== "Canvas"
                  ? canvas.resource.source.id
                  : undefined,
            })
          : "",
      )}
    </div>
  );
}
