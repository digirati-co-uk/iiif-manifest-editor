"use client";

import { ProjectProvider, useCurrentProject } from "@manifest-editor/projects";
import { Layout, MultiAppProvider, PreviewConfiguration, ShellProvider, mapApp } from "@manifest-editor/shell";
import { GlobalStyle } from "@manifest-editor/ui/GlobalStyle";
import * as aboutApp from "./apps/About";
import * as splashApp from "./apps/Splash";
import * as manifestEditorApp from "@manifest-editor/manifest-preset";
import * as collectionEditorApp from "@manifest-editor/collection-preset";
import { AppHeader } from "./components/AppHeader";
import "manifest-editor/dist/index.css";

// Aim: For this to be exactly like the current manifest editor.

const apps = {
  about: mapApp(aboutApp),
  splash: mapApp(splashApp),
  "manifest-editor": mapApp(manifestEditorApp),
  "collection-editor": mapApp(collectionEditorApp),
};

const previews: PreviewConfiguration[] = [
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
      url: "https://tomcrane.github.io/scratch/mirador3/?iiif-content={manifestId}",
    },
  },
  {
    id: "universal-viewer-3",
    type: "external-manifest-preview",
    label: "Universal viewer (v3)",
    config: {
      url: "https://uv-v3.netlify.app/#?manifest={manifestId}",
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

export default function LegacyManifestEditor() {
  return (
    <div className="flex flex-1 h-[100vh] w-full">
      <MultiAppProvider apps={apps} instanceId="default" initialApp={{ id: "splash" }}>
        <ProjectProvider>
          <InternalEditor />
        </ProjectProvider>
      </MultiAppProvider>
    </div>
  );
}

function InternalEditor() {
  const { resource } = useCurrentProject();

  if (!resource) {
    return null;
  }

  return (
    <ShellProvider resource={resource} config={config}>
      <GlobalStyle />
      <Layout header={<AppHeader />} />
    </ShellProvider>
  );
}
