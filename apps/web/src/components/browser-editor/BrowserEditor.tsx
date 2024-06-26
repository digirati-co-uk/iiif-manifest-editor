"use client";

import { useBrowserProject } from "./browser-state";
import {
  AppProvider,
  Layout,
  PreviewButton,
  PreviewConfiguration,
  ShellProvider,
  mapApp,
  useSaveVault,
} from "@manifest-editor/shell";
import { VaultProvider } from "react-iiif-vault";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import { GlobalStyle } from "@manifest-editor/ui/GlobalStyle";
import { useState } from "react";
import Link from "next/link";
import { ManifestEditorLogo } from "@manifest-editor/components";
import { GlobalNav } from "../site/GlobalNav";

import "manifest-editor/dist/index.css";
import "@manifest-editor/editors/dist/index.css";
import "@manifest-editor/shell/dist/index.css";
import "@manifest-editor/components/dist/index.css";
import { usePathname, useSearchParams } from "next/navigation";

const manifestEditor = mapApp(manifestEditorPreset);

const previews: PreviewConfiguration[] = [
  {
    id: "theseus",
    type: "external-manifest-preview",
    label: "Theseus",
    config: {
      url: "https://theseus-viewer.netlify.app/?manifest={manifestId}",
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

const config = { previews };

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
  } = useBrowserProject(id);
  const [allowAnyway, setAllowAnyway] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useSaveVault(
    vault,
    () => {
      console.log("saving...");
      saveVaultData.mutate(false);
    },
    5000,
    vaultReady && !!project && (!wasAlreadyOpen || allowAnyway)
  );

  const header = (
    <header className="h-[64px] flex w-full gap-12 px-4 items-center">
      <Link href="/" className="w-96 flex justify-start">
        <ManifestEditorLogo />
      </Link>
      <div className="flex-1" />
      <div className="flex items-center justify-center gap-5">
        <GlobalNav />
        <div className="flex items-center">
          <PreviewButton downloadEnabled />
        </div>
      </div>
    </header>
  );

  if (isProjectLoading) return <div>Loading...</div>;
  if (isProjectError || !project) return <div>Error: {projectError?.message}</div>;

  if (wasAlreadyOpen && !allowAnyway) {
    return (
      <div>
        Already open in another window.
        <button
          onClick={() => {
            userForceUpdate.mutateAsync().then(() => setAllowAnyway(true));
          }}
        >
          Edit anyway
        </button>
      </div>
    );
  }

  if (staleEtag) {
    return (
      <div>
        Editing in another window
        <button
          onClick={() => {
            reopenProject();
          }}
        >
          Open here
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-[100vh] w-full">
      <VaultProvider vault={vault}>
        <AppProvider appId="manifest-editor" definition={manifestEditor} instanceId={id}>
          <VaultProvider vault={vault}>
            <ShellProvider resource={project.resource} config={config}>
              <GlobalStyle />
              <Layout header={header} />
            </ShellProvider>
          </VaultProvider>
        </AppProvider>
      </VaultProvider>
    </div>
  );
}
