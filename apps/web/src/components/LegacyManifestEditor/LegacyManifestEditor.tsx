"use client";

import {
  ProjectProvider,
  useOptionalCurrentProject,
  useProjectCreators,
} from "@manifest-editor/projects";
import {
  Layout,
  MultiAppProvider,
  PreviewConfiguration,
  ShellProvider,
  mapApp,
} from "@manifest-editor/shell";
import * as aboutApp from "./apps/About";
import * as splashApp from "./apps/Splash";
import * as manifestEditorApp from "@manifest-editor/manifest-preset";
import * as collectionEditorApp from "@manifest-editor/collection-preset";
import { AppHeader } from "./components/AppHeader";
// import "manifest-editor/dist/index.css";
import "@manifest-editor/editors/dist/index.css";
import "@manifest-editor/components/dist/index.css";
import { useState } from "react";

// Aim: For this to be exactly like the current manifest editor.

const classes = {
  container: "m-4",
  row: "border-b border-gray-200 flex flex-col flex-wrap py-2",
  label: "font-bold text-slate-600 w-full text-sm font-semibold mb-0",
  value: "text-sm text-slate-800 block [&>a]:underline",
  empty: "text-gray-400",
};

// class="[&>a]:underline"
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
      url: "https://universalviewer.dev/#?iiifManifestId={manifestId}",
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
    id: "annona",
    type: "external-manifest-preview",
    label: "Annona",
    config: {
      url: "https://ncsu-libraries.github.io/annona/tools/#/display?url={manifestId}&viewtype=iiif-storyboard&settings=%7B%22fullpage%22%3Atrue%7D",
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
      <MultiAppProvider
        apps={apps}
        instanceId="default"
        initialApp={{ id: "splash" }}
      >
        <ProjectProvider>
          <InternalEditor />
        </ProjectProvider>
      </MultiAppProvider>
    </div>
  );
}

function InternalEditor() {
  const { createBlankManifest } = useProjectCreators();
  const project = useOptionalCurrentProject();
  const [loading, setIsLoading] = useState(false);

  if (!project) {
    return (
      <div className="m-auto text-center">
        <h4 className={`text-3xl text-center text-slate-700 mb-8`}>
          Welcome to Manifest editor
        </h4>
        {loading ? (
          <div className={`text-2xl text-center text-slate-500 mb-8`}>
            Loading...
          </div>
        ) : (
          <button
            className="bg-me-primary-500 text-white py-2 px-4 rounded"
            onClick={() => {
              setIsLoading(true);
              createBlankManifest();
            }}
          >
            Get started
          </button>
        )}
      </div>
    );
  }

  return (
    <ShellProvider resource={project.resource} config={config}>
      <Layout header={<AppHeader />} />
    </ShellProvider>
  );
}
