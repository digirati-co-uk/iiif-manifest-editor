"use client";

import { useBrowserProject } from "./browser-state";
import {
  AppProvider,
  Config,
  Layout,
  PreviewButton,
  PreviewConfiguration,
  ShellProvider,
  ConfigEditor,
  mapApp,
  useEditingResource,
  useLayoutActions,
  useLayoutState,
  usePreviewContext,
  useSaveVault,
} from "@manifest-editor/shell";
import { VaultProvider } from "react-iiif-vault";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import { GlobalStyle } from "@manifest-editor/ui/GlobalStyle";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DefaultTooltipContent,
  ManifestEditorLogo,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TooltipTrigger,
  Tooltip,
} from "@manifest-editor/components";
import { GlobalNav } from "../site/GlobalNav";

import "manifest-editor/dist/index.css";
import "@manifest-editor/editors/dist/index.css";
import "@manifest-editor/shell/dist/index.css";
import "@manifest-editor/components/dist/index.css";
import { usePathname, useSearchParams } from "next/navigation";
import { createThumbnailHelper } from "@iiif/helpers";
import { useQuery } from "@tanstack/react-query";
import { Label } from "react-aria-components";

const previews: PreviewConfiguration[] = [
  {
    id: "theseus",
    type: "external-manifest-preview",
    label: "Theseus",
    config: {
      url: "https://theseus-viewer.netlify.app/?iiif-content={manifestId}&ref=manifest-editor",
    },
  },
  {
    id: "universal-viewer",
    type: "external-manifest-preview",
    label: "Universal viewer",
    config: {
      url: "https://uv-v4.netlify.app/#?iiifManifestId={manifestId}",
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
    id: "delft-viewer",
    type: "external-manifest-preview",
    label: "Delft viewer",
    config: {
      url: "https://delft-viewer.netlify.app/#manifest={manifestId}",
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

export default function BrowserEditor({ id }: { id: string }) {
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
  const [allowAnyway, setAllowAnyway] = useState(false);
  const thumbnailHelper = useMemo(() => {
    return createThumbnailHelper(vault);
  }, [vault]);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const saveVault = useCallback(async () => {
    if (project) {
      const fullResource = vault.get(project.resource);
      if (!fullResource) return;
      const thumbnail = await thumbnailHelper.getBestThumbnailAtSize(fullResource, { width: 256, height: 256 }, false);
      const resource = {
        ...project.resource,
        label: fullResource.label,
        thumbnail: thumbnail?.best?.id || "",
      };
      await saveVaultData.mutateAsync({ force: false, resource });
    }
  }, [project, vault]);

  useSaveVault(vault, saveVault, 5000, vaultReady && !!project && (!wasAlreadyOpen || allowAnyway));

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
    return {
      ...config,
      ...projectConfig,
    };
  }, [projectConfig]);

  const manifestEditor = useMemo(
    () =>
      mapApp(manifestEditorPreset, (app) => {
        return {
          ...app,
          layout: {
            ...app.layout,
            leftPanels: [
              ...(app.layout.leftPanels || []),
              {
                divide: true,
                id: "config",
                label: "Config",
                icon: <SettingsIcon />,
                render: () => <ConfigEditor />,
              },
            ],
            modals: [
              ...(app.layout.modals || []),
              {
                id: "share-modal",
                icon: <ShareIcon />,
                label: "Share",
                render: () => <SharePanel projectId={id} />,
              },
            ],
          },
        };
      }),
    [project]
  );

  const header = (
    <header className="h-[64px] flex w-full gap-12 px-4 items-center">
      <Link href="/" className="w-96 flex justify-start">
        <ManifestEditorLogo />
      </Link>
      <div className="flex-1" />
      <div className="flex items-center justify-center gap-5">
        <GlobalNav />
        <div className="flex items-center gap-2">
          <ShareButton />
          <PreviewButton downloadEnabled />
        </div>
      </div>
    </header>
  );

  if (isProjectLoading) return <div>Loading...</div>;
  if (isProjectError || !project) return <div>Error: {projectError?.message}</div>;

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
    <div className="flex flex-1 h-[100vh] w-full">
      <VaultProvider vault={vault}>
        <AppProvider appId="manifest-editor" definition={manifestEditor} instanceId={id}>
          <VaultProvider vault={vault}>
            <ShellProvider resource={project.resource} config={mergedConfig} saveConfig={saveProjectConfig}>
              <GlobalStyle />
              <Layout header={header} />
            </ShellProvider>
          </VaultProvider>
        </AppProvider>
      </VaultProvider>
    </div>
  );
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
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="#5f6368" viewBox="0 -960 960 960" {...props}>
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
  tab,
}: {
  manifest: string;
  action: "preview" | "import";
  projectId?: string;
  tab?: string;
  selected?: { id: string; type: string };
}) {
  const currentUrl = new URL(window.location.href);
  const baseUrl = new URL(currentUrl.origin);

  baseUrl.pathname = "/share";

  baseUrl.searchParams.set("action", action);

  if (projectId) {
    baseUrl.searchParams.set("projectId", projectId);
  }

  baseUrl.searchParams.set("iiif-content", manifest);

  if (tab) {
    baseUrl.searchParams.set("selected-tab", tab);
  }

  if (selected) {
    baseUrl.searchParams.set("selected-id", selected.id);
    baseUrl.searchParams.set("selected-type", selected.type);
  }

  return baseUrl.toString();
}

function SharePanel({ projectId }: { projectId: string }) {
  const { actions } = usePreviewContext();
  const resource = useEditingResource();
  const { rightPanel } = useLayoutState();

  const [options, setOptions] = useState({
    includeCurrentSelectedItem: true,
    includeCurrentTab: true,
  });

  const { includeCurrentSelectedItem, includeCurrentTab } = options;

  const selected = resource ? resource.resource.source : undefined;
  const currentTab = rightPanel.current === "@manifest-editor/editor" ? rightPanel.state.currentTab : undefined;

  const { data } = useQuery({
    queryKey: ["share", { projectId }],
    queryFn: async () => {
      return await actions.getPreviewLink();
    },
  });

  const form = (
    <div className="flex-1 flex gap-1 flex-col">
      <div className="flex gap-2 p-2 has-[:checked]:text-me-primary-500 rounded">
        <input
          type="checkbox"
          id="includeCurrentSelectedItem"
          value="includeCurrentSelectedItem"
          checked={includeCurrentSelectedItem}
          onChange={(e) => setOptions({ ...options, includeCurrentSelectedItem: e.target.checked })}
        />
        <Label htmlFor="includeCurrentSelectedItem">Share current selected item</Label>
      </div>
      <div className="flex gap-2 p-2 has-[:checked]:text-me-primary-500 rounded">
        <input
          type="checkbox"
          id="includeCurrentTab"
          value="includeCurrentTab"
          checked={includeCurrentTab}
          onChange={(e) => setOptions({ ...options, includeCurrentTab: e.target.checked })}
        />
        <Label htmlFor="includeCurrentTab">Include selected right panel tab</Label>
      </div>
    </div>
  );

  const renderLink = (link: string) =>
    link ? (
      <div>
        <div className="flex gap-2 my-4">
          <input className="flex-1 p-2 border-b bg-gray-50" type="text" value={link} readOnly />
          <button
            className="bg-me-primary-500 text-white px-5 rounded-md"
            onClick={() => {
              navigator.clipboard.writeText(link);
            }}
          >
            Copy
          </button>
        </div>
        <a href={link} target="_blank" className="text-me-primary-500 underline">
          Share link
        </a>
      </div>
    ) : (
      <div>Loading...</div>
    );

  return (
    <div className="min-h-64 px-4">
      <Tabs>
        <TabList aria-label="Choose a share option" className="mb-4">
          <Tab id="transfer-workspace">Transfer workspace</Tab>
          <Tab id="share-preview">Share preview</Tab>
        </TabList>
        <TabPanel id="transfer-workspace">
          {form}

          {renderLink(
            data
              ? createShareLink({
                  manifest: data,
                  action: "import",
                  projectId,
                  selected: includeCurrentSelectedItem ? selected : undefined,
                  tab: includeCurrentTab ? currentTab : undefined,
                })
              : ""
          )}
        </TabPanel>
        <TabPanel id="share-preview">
          {form}

          {renderLink(
            data
              ? createShareLink({
                  manifest: data,
                  action: "preview",
                  selected: includeCurrentSelectedItem ? selected : undefined,
                  tab: includeCurrentTab ? currentTab : undefined,
                })
              : ""
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
