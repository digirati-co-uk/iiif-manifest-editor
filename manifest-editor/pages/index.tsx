import { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { AddManifestModal } from "../components/molecules/AddManifestModal";
import { Button } from "../components/atoms/Button";
import { AddIcon } from "../components/icons/AddIcon";
import { ThumbnailStrip } from "../components/organisms/ThumbnailStrip";
import { CanvasView } from "../components/organisms/CanvasView";
import { Placeholder } from "../components/atoms/Placeholder";
import { Toolbar } from "../components/layout/Toolbar";
import { FlexContainerRow } from "../components/layout/FlexContainer";
import { EditorPanel } from "../components/layout/EditorPanel";

import { useManifest, useVault } from "react-iiif-vault";
import { useSave } from "../hooks/useSave";
import { DropdownMenu } from "../components/atoms/DropdownMenu";

// Temporary code until big fixed on react-iiif-vault
import { serialize, serializeConfigPresentation3 } from "@iiif/parser";
import { PersistenceModal } from "../components/molecules/PersistenceModal";

type Persistance = {
  deleteLocation?: string;
  expirationTtl?: Number;
  location?: string;
  updateLocation?: string;
};

const Home: NextPage = () => {
  const vault = useVault();
  const manifest = useManifest();

  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [persistedManifest, setpersistedManifest] = useState<Persistance>({});
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAgain, setShowAgain] = useState(true);

  useEffect(() => {
    setModalVisible(false);
    console.log(manifest);
  }, [manifest]);

  const setManifest = () => {};

  const saveManifest = async () => {
    if (manifest) {
      // Temporary code until big fixed on react-iiif-vault
      const man = await serialize(
        vault.getState().iiif,
        manifest,
        serializeConfigPresentation3
      );
      // const manifestToPersist = await vault.toPresentation3(manifest)
      const data = await useSave(man);
      setpersistedManifest(data ? data : "");
      if (showAgain) setShowPreviewModal(true);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Manifest Editor</title>
        <meta name="description" content="IIIF Manifest Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {modalVisible ? (
        <AddManifestModal
          manifest={manifest ? manifest?.id : ""}
          onChange={setManifest}
          close={() => setModalVisible(false)}
        />
      ) : (
        <></>
      )}

      {showPreviewModal ? (
        <PersistenceModal
          manifest={(persistedManifest && persistedManifest.location) ? persistedManifest.location: ""}
          value={!showAgain}
          onChange={() => setShowAgain(!showAgain)}
          close={() => setShowPreviewModal(false)}
        />
      ) : (
        <></>
      )}
      <main className={styles.main}>
        <Placeholder>IIIF Manifest Editor</Placeholder>
        <DropdownMenu
          selectedPreviewIndex={selectedPreviewIndex}
          onClick={() => saveManifest()}
          label={"Preview"}
          // MOVE THESE OPTIONS TO CONFIG
          options={[
            {
              label: (
                <a href={"/preview"} target={"_blank"}>
                  Preview internally on universal viewer
                </a>
              )
            },
            {
              label: (
                <a
                  href={`http://universalviewer.io/uv.html?manifest=${persistedManifest.location}`}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  Preview externally on Universal Viewer
                </a>
              )
            },
            {
              label: (
                <a
                  href={`https://tomcrane.github.io/scratch/mirador3/?iiif-content=${persistedManifest.location}`}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  Preview externally on Mirador
                </a>
              )
            }
          ]}
        ></DropdownMenu>
        <Toolbar>
          <Button
            onClick={() => setModalVisible(!modalVisible)}
            title="Add a manifest"
            color={"#6b6b6b"}
          >
            <AddIcon />
          </Button>
          <Button
            // This will change but just to get some MVP
            onClick={() => setEditorPanelOpen(true)}
            title="Edit manifest label"
          >
            Edit Manifest Label
          </Button>
          <Button
            // This will evolve to a file/save option and will be used for the permalink eventually
            onClick={() => saveManifest()}
            title="Save manifest"
          >
            Save manifest
          </Button>
        </Toolbar>
        <FlexContainerRow>
          <ThumbnailStrip />
          <CanvasView manifest={manifest ? manifest?.id : ""} />
          <EditorPanel
            // Hard coded value here but this will depend on the element being edited
            title={"Edit manifest label"}
            open={editorPanelOpen}
            close={() => setEditorPanelOpen(false)}
          >
            {/* The children of this will vary */}
          </EditorPanel>
        </FlexContainerRow>
      </main>

      <footer className={styles.footer}>
        Your manifest is saved here: {persistedManifest.location}
      </footer>
    </div>
  );
};

export default Home;
