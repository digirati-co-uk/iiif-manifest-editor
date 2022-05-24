import { ManifestNormalized } from "@iiif/presentation-3";
import React, { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { CanvasContext } from "react-iiif-vault";
import { getManifestNomalized } from "../../helpers/getManifestNormalized";
import invariant from "tiny-invariant";
import { LayoutProvider } from "../../shell/Layout/Layout.context";
import { ProjectProvider } from "../../shell/ProjectContext/ProjectContext";
import { PreviewProvider } from "../../shell/PreviewContext/PreviewContext";
import { PreviewConfiguration } from "../../shell/PreviewContext/PreviewContext.types";
import { ManifestEditorProvider } from "../../apps/ManifestEditor/ManifestEditor.context";
import { useLocalStorage } from "../../madoc/use-local-storage";

// @todo maybe split this into an internal and normal context
interface ShellContextInterface {
  // Public (i.e. application)
  resourceID: string | null;
  unsavedChanges: boolean;
  changeResourceID: (id: string | null) => void;
  recentManifests: ManifestNormalized[];
  setCurrentCanvasId: (id: string) => void; // @todo this will be more contextual

  // Internal (i.e. should only be called from Shell UI)
  selectedApplication: "ManifestEditor" | "Browser" | "Splash" | "About"; // @todo maybe change to just string?
  changeSelectedApplication: (application: "ManifestEditor" | "Browser" | "Splash" | "About") => void;
  setUnsavedChanges: (bol: boolean) => void;
  updateRecentManifests: (manifest: string) => Promise<void>;
  newTemplates: any; // @todo this needs a type.
  setNewTemplates: (templates: any) => void;
}

const ShellContext = React.createContext<ShellContextInterface | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);

  invariant(ctx, "Can only be called from <ShellProvider />");

  return ctx;
}

const previewConfigs: PreviewConfiguration[] = [
  {
    id: "universal-viewer",
    config: { url: "https://uv-v4.netlify.app/#?iiifManifestId={manifestId}" },
    type: "external-manifest-preview",
    label: "Universal viewer 4",
  },
  {
    id: "universal-viewer-3",
    config: { url: "https://uv-v3.netlify.app/#?manifest={manifestId}" },
    type: "external-manifest-preview",
    label: "Universal viewer 3",
  },
  {
    id: "iiif-preview",
    config: { url: "https://iiif-preview.stephen.wf/store" },
    type: "iiif-preview-service",
    label: "IIIF Preview",
  },
];

export const ShellProvider = ({ children }: { children: ReactNode }) => {
  // const vault = useExistingVault();
  const [resourceID, setResourceID] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  // const [manifest, setManifest] = useState<any>();

  const [currentCanvasId, setCurrentCanvasId] = useState("");

  const [selectedApplication, setSelectedApplication] = useLocalStorage<
    "ManifestEditor" | "Browser" | "Splash" | "About"
  >("SelectedApplication", "ManifestEditor");

  const [newManifestTemplates, setNewManifestsTemplates] = useState<any>();

  const changeSelectedApplication = (app: "ManifestEditor" | "Browser" | "Splash" | "About") => {
    setSelectedApplication(app);
  };

  const [recentManifests, setRecentManifests] = useState<Array<ManifestNormalized>>([]);

  const updateRecentManifests = useCallback(
    async (newManifest: string) => {
      const recents = [...recentManifests];
      const toAdd = await getManifestNomalized(newManifest);
      if (toAdd) {
        recents.push(toAdd);
      }
      setRecentManifests(recents);
    },
    [recentManifests]
  );

  const changeResourceID = async (id: string | null) => {
    // We want to check that resource is returning 200 before loading it into the vault.
    // We probably want to do some error handling here
    // For now we are just going for the default | previous value
    // maybe load the launch screen
    if (id) {
      try {
        const success = await fetch(id);
        if (success.ok) {
          setResourceID(id);
        }
      } catch (error) {
        console.error("Couldn't fetch the resource, has the temporary link expired?");
      }
    }
  };

  const shellSettings = useMemo(
    () => ({
      selectedApplication,
      changeSelectedApplication,
      changeResourceID,
      resourceID,
      unsavedChanges,
      setUnsavedChanges,
      recentManifests,
      updateRecentManifests,
      newTemplates: newManifestTemplates,
      setNewTemplates: setNewManifestsTemplates,
      setCurrentCanvasId,
    }),
    [newManifestTemplates, recentManifests, resourceID, selectedApplication, unsavedChanges, updateRecentManifests]
  );

  // @todo remove <CanvasContext /> when it's no longer required.
  return (
    <LayoutProvider>
      <ShellContext.Provider value={shellSettings}>
        <ProjectProvider>
          <PreviewProvider configs={previewConfigs}>
            <ManifestEditorProvider defaultLanguages={["en"]} behaviorProperties={[]}>
              {currentCanvasId ? <CanvasContext canvas={currentCanvasId}>{children}</CanvasContext> : children}
            </ManifestEditorProvider>
          </PreviewProvider>
        </ProjectProvider>
      </ShellContext.Provider>
    </LayoutProvider>
  );
};
