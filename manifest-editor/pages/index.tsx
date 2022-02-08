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

import { useManifest } from "@hyperion-framework/react-vault";
import { useSave } from "../hooks/useSave";
import { DropdownMenu } from "../components/atoms/DropdownMenu";

type Persistance = {
  deleteLocation?: string;
  expirationTtl?: Number;
  location?: string;
  updateLocation?: string;
};

const Home: NextPage = () => {
  const manifest = useManifest();

  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [persistedManifest, setpersistedManifest] = useState<Persistance>({});

  useEffect(() => {
    setModalVisible(false);
  }, [manifest]);

  const setManifest = () => {};

  const saveManifest = async () => {
    const data = await useSave(manifest);
    setpersistedManifest(data ? data : "");
    console.log(data);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Manifest Editor</title>
        <meta name="description" content="IIIF Manifest Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Placeholder />
        <Toolbar>
          <Button
            onClick={() => setModalVisible(!modalVisible)}
            title="Add a manifest"
            color={"#6b6b6b"}
          >
            <AddIcon />
          </Button>
          <Button
            // Implement a change of viewer type here
            // Viewer options will be handled in some config
            onClick={() => {}}
            title="Preview"
          >
            <a href={"/preview"} target={"_blank"}>
              Preview
            </a>
          </Button>
          <Button
            // This will change but just to get some MVP
            onClick={() => setEditorPanelOpen(true)}
            title="Edit manifest label"
          >
            Edit Manifest Label
          </Button>
          <Button
            // This will evolve to a file/save option
            onClick={() => saveManifest()}
            title="Save manifest"
          >
            Save manifest
          </Button>
          <DropdownMenu
            label={"Preview"}
            options={[
              {
                label: (
                  <a href={"/preview"} target={"_blank"}>
                    Preview internally on canvas panel
                  </a>
                )
              },
              {
                label: (
                  <a
                    href={`http://universalviewer.io/uv.html?manifest=${persistedManifest.location}`}
                    target={"_blank"}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Preview externally on Universal Viewer
                  </a>
                )
              }
            ]}
          ></DropdownMenu>
        </Toolbar>
        {modalVisible ? (
          <AddManifestModal
            manifest={manifest ? manifest?.manifest : ""}
            onChange={setManifest}
            close={() => setModalVisible(false)}
          />
        ) : (
          <></>
        )}

        <FlexContainerRow>
          <ThumbnailStrip />
          <CanvasView manifest={manifest} />
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
