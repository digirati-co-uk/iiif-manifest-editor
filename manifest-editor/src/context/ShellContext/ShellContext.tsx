import { ManifestNormalized } from "@iiif/presentation-3";
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CanvasContext, ManifestContext, useExistingVault, VaultProvider } from "react-iiif-vault";
import { getManifestNomalized } from "../../helpers/getManifestNormalized";
import invariant from "tiny-invariant";

// @todo maybe split this into an internal and normal context
interface ShellContextInterface {
  // Public (i.e. application)
  resourceID: string | null;
  unsavedChanges: boolean;
  changeResourceID: (id: string | null) => void;
  recentManifests: ManifestNormalized[];
  setCurrentCanvasId: (id: string) => void; // @todo this will be more contextual

  // Internal (i.e. should only be called from Shell UI)
  selectedApplication: "ManifestEditor" | "Browser" | "Splash"; // @todo maybe change to just string?
  changeSelectedApplication: (application: "ManifestEditor" | "Browser" | "Splash") => void;
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

export const ShellProvider = ({ children }: { children: ReactNode }) => {
  const vault = useExistingVault();
  const [resourceID, setResourceID] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [manifest, setManifest] = useState<any>();

  const [currentCanvasId, setCurrentCanvasId] = useState("");

  const [selectedApplication, setSelectedApplication] = useState<"ManifestEditor" | "Browser" | "Splash">(
    "ManifestEditor"
  );

  const [newManifestTemplates, setNewManifestsTemplates] = useState<any>();

  const changeSelectedApplication = (app: "ManifestEditor" | "Browser" | "Splash") => {
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

  useEffect(() => {
    // Determine if the user has been to the site before
    // and send them to the splash screen if not
    // Set to true from now on.
    if (!localStorage.getItem("previouslyVisited")) {
      setSelectedApplication("Splash");
      localStorage.setItem("previouslyVisited", "true");
    }
    // Get recent manifests from localStorage
    if (localStorage.getItem("recentManifests")) {
      const manifests = JSON.parse(localStorage.getItem("recentManifests") || "{}");
      if (manifests.length > 0) {
        setResourceID(manifests.splice(-1)[0].id);
      }
      setRecentManifests(manifests);
    }
  }, []);

  // @todo replace with useExternalManifest();
  useEffect(() => {
    const loadManifest = async () => {
      if (!resourceID || resourceID === "") {
        return;
      }
      const mani = await vault.loadManifest(resourceID);
      setManifest(mani);
      if (mani && mani.items && mani.items[0] && mani.items[0]?.id) {
        setCurrentCanvasId(mani.items[0]?.id);
      } else {
        setCurrentCanvasId("");
      }
    };
    loadManifest();
  }, [resourceID, vault]);

  // @todo split into generic localStorage `useState()` equiv.
  useEffect(() => {
    // Send changes to localstorage

    const manifests = JSON.parse(localStorage.getItem("recentManifests") || "[]");

    manifests.push(recentManifests);

    localStorage.setItem("recentManifests", JSON.stringify(recentManifests));
  }, [recentManifests]);

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

  return (
    <ShellContext.Provider value={shellSettings}>
      <VaultProvider vault={vault}>
        <ManifestContext manifest={manifest?.id}>
          <CanvasContext canvas={currentCanvasId}>{children}</CanvasContext>
        </ManifestContext>
      </VaultProvider>
    </ShellContext.Provider>
  );
};
