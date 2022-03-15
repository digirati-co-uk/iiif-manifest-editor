import { useEffect, useState } from "react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import ShellContext from "../components/apps/Shell/ShellContext";

import { VaultProvider, SimpleViewerProvider } from "react-iiif-vault";

// Next.js <App /> component will keep state alive during client side transitions.
// If you refresh the page, or link to another page without utilizing Next.js <Link />,
// the <App /> will initialize again and the state will be reset.

// Here we are overriding Next.js implimentation of page creations to keep the manifest vault
// live between pages, like previewing the data.

// function MyApp({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;
// }

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const [resourceID, setResouceID] = useState(
    //   // We will want to actually implement some options/templates etc
    //   // but just implementing with some examples for development purposes.
    "https://digirati-co-uk.github.io/wunder.json"
  );
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState<"ManifestEditor" | "Browser" | "Splash">("ManifestEditor");

  const changeSelectedApplication = (
    app: "ManifestEditor" | "Browser" | "Splash"
  ) => {
    setSelectedApplication(app);
  };

  useEffect(() => {
    console.log(localStorage.getItem("previouslyVisited"));
    if (!localStorage.getItem("previouslyVisited")) {
      setSelectedApplication("Splash");
      localStorage.setItem("previouslyVisited", "true");
    }
  }, []);

  const changeResourceID = async (id: string | null) => {
    // We want to check that resource is returning 200 before loading it into the vault.
    // We probably want to do some error handling here
    // For now we are just going for the default | previous value
    // maybe load the launch screen
    if (id) {
      try {
        const success = await fetch(id);
        if (success.ok) setResouceID(id);
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
  };

  return (
    <>
      <ShellContext.Provider value={shellSettings}>
        <VaultProvider>
          <SimpleViewerProvider manifest={resourceID}>
            <Component
              {...pageProps}
              selectedApplication={selectedApplication}
            />
          </SimpleViewerProvider>
        </VaultProvider>
      </ShellContext.Provider>
    </>
  );
};

export default CustomApp;
