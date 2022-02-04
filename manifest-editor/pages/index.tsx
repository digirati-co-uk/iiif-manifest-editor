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

const Home: NextPage = () => {
  const [manifest, setManifest] = useState(
    "https://view.nls.uk/manifest/1227/7148/122771487/manifest.json"
  );
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setModalVisible(false);
  }, [manifest]);

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
          >
            <AddIcon />
          </Button>
          <Button
            // Implement a change of viewer type here
            onClick={() => {}}
            title="Preview"
          >
            <a href={"/preview"} target={"_blank"}>
              Preview{" "}
            </a>
          </Button>
        </Toolbar>
        {modalVisible ? (
          <AddManifestModal
            manifest={manifest}
            onChange={setManifest}
            close={() => setModalVisible(false)}
          />
        ) : (
          <></>
        )}

        <FlexContainerRow>
          <ThumbnailStrip />
          <CanvasView manifest={manifest} />
          <div>You are viewing: {manifest}</div>
        </FlexContainerRow>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
