import { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";

import styles from "../styles/Home.module.css";
import { Button } from "../components/atoms/Button";
import { CanvasView } from "../components/organisms/CanvasView";
import { Toolbar } from "../components/layout/Toolbar";
import { FlexContainerRow } from "../components/layout/FlexContainer";
import { EditorPanel } from "../components/layout/EditorPanel";
import { ContentSelector } from "../components/layout/ContentSelector";
import { Shell } from "../components/apps/Shell/Shell";

import data from "../config.json";
import ManifestEditorContext from "../components/apps/ManifestEditor/ManifestEditorContext";
import ShellContext from "../components/apps/Shell/ShellContext";
import { IIIFBrowser } from "../components/apps/IIIFBrowser/IIIFBrowser";
import { SimpleViewerProvider, VaultProvider } from "react-iiif-vault";

export const getStaticProps = async () => {
  return {
    props: {
      config: data,
    },
  };
};

const Home: NextPage = (props: any) => {
  const [selectedProperty, setSelectedProperty] = useState("id");

  const [resourceID, setResouceID] = useState(
    //   // We will want to actually implement some options/templates etc
    //   // but just implementing with some examples for development purposes.
    "https://iiif.wellcomecollection.org/presentation/b28799495"
  );

  const [selectedApplication, setSelectedApplication] =
    useState<"ManifestEditor" | "Browser">("ManifestEditor");
  const changeSelectedProperty = (property: string) => {
    setSelectedProperty(property);
  };
  const changeSelectedApplication = (app: "ManifestEditor" | "Browser") => {
    setSelectedApplication(app);
  };
  const changeResourceID = (id: string | null) => {
    if (id) setResouceID(id);
  };

  const editorSettings = { selectedProperty, changeSelectedProperty };
  const shellSettings = {
    selectedApplication,
    changeSelectedApplication,
    changeResourceID,
    resourceID
  };

  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [view, setView] = useState<"thumbnails" | "tree">("tree");

  return (
    <ShellContext.Provider value={shellSettings}>
      <VaultProvider>
        <SimpleViewerProvider manifest={resourceID}>
          <div className={styles.container}>
            <Head>
              <title>Manifest Editor</title>
              <meta name="description" content="IIIF Manifest Editor" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
              <ManifestEditorContext.Provider value={editorSettings}>
                <Shell
                  setView={(view: "thumbnails" | "tree") => setView(view)}
                  previewConfig={props.config.preview}
                />
                {selectedApplication === "ManifestEditor" && (
                  <>
                    <Toolbar>
                      <Button
                        // This will change but just to get some MVP
                        onClick={() => setEditorPanelOpen(true)}
                        title="Open editor panel"
                      >
                        Open editor panel
                      </Button>
                    </Toolbar>
                    <FlexContainerRow>
                      <ContentSelector view={view} />
                      <CanvasView />
                      <EditorPanel
                        open={editorPanelOpen}
                        close={() => setEditorPanelOpen(false)}
                        languages={props.config.defaultLanguages}
                      ></EditorPanel>
                    </FlexContainerRow>
                  </>
                )}
                {selectedApplication === "Browser" && <IIIFBrowser />}
              </ManifestEditorContext.Provider>
            </main>
            <footer className={styles.footer}></footer>
          </div>
        </SimpleViewerProvider>
      </VaultProvider>
    </ShellContext.Provider>
  );
};

export default Home;
