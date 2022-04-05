import { useEffect, useState } from "react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import ShellContext from "../components/apps/Shell/ShellContext";

import {
  VaultProvider,
  useExistingVault,
  ManifestContext,
  CanvasContext,
} from "react-iiif-vault";
import { ManifestNormalized } from "@iiif/presentation-3";
import { getManifestNomalized } from "../helpers/getManifestNormalized";

// Next.js <App /> component will keep state alive during client side transitions.
// If you refresh the page, or link to another page without utilizing Next.js <Link />,
// the <App /> will initialize again and the state will be reset.

// Here we are overriding Next.js implimentation of page creations to keep the manifest vault
// live between pages, like previewing the data.

// function MyApp({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;
// }

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const vault = useExistingVault();
  const [resourceID, setResourceID] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [manifest, setManifest] = useState<any>();
  const [currentCanvasId, setCurrentCanvasId] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState<"ManifestEditor" | "Browser" | "Splash">("ManifestEditor");

  const [newManifestTemplates, setNewManifestsTemplates] = useState<any>();

  const changeSelectedApplication = (
    app: "ManifestEditor" | "Browser" | "Splash"
  ) => {
    setSelectedApplication(app);
  };

  const [recentManifests, setRecentManifests] = useState<
    Array<ManifestNormalized>
  >([]);

  const updateRecentManifests = async (newManifest: string) => {
    const recents = [...recentManifests];
    const toAdd = await getManifestNomalized(newManifest);
    if (toAdd) recents.push(toAdd);
    setRecentManifests(recents);
  };

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
      const manifests = JSON.parse(
        localStorage.getItem("recentManifests") || "{}"
      );
      if (manifests.length > 0) {
        setResourceID(manifests.splice(-1)[0].id);
      }
      setRecentManifests(manifests);
    }
  }, []);

  useEffect(() => {
    const loadManifest = async () => {
      if (!resourceID || resourceID === "") return;
      const mani = await vault.loadManifest(resourceID);
      setManifest(mani);
      if (mani && mani.items && mani.items[0] && mani.items[0]?.id) {
        setCurrentCanvasId(mani.items[0]?.id);
      } else {
        setCurrentCanvasId("");
      }
    };
    loadManifest();
  }, [resourceID]);

  useEffect(() => {
    // Send changes to localstorage
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
        console.log(
          "Couldn't fetch the resource, has the temporary link expired?"
        );
      }
    }
  };

  const shellSettings = {
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
  };

  return (
    <div key={manifest?.id}>
      <ShellContext.Provider value={shellSettings}>
        <VaultProvider vault={vault}>
          <ManifestContext manifest={manifest?.id}>
            <CanvasContext canvas={currentCanvasId}>
              <Component
                {...pageProps}
                selectedApplication={selectedApplication}
              />
            </CanvasContext>
          </ManifestContext>
        </VaultProvider>
      </ShellContext.Provider>
    </div>
  );
};

export default CustomApp;
