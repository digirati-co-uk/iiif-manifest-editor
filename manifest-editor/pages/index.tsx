import { useState, useEffect } from "react";
import type, { NextPage } from "next";
import Head from "next/head";
import {
  VaultProvider,
  SimpleViewerProvider
} from "@hyperion-framework/react-vault";
import styles from "../styles/Home.module.css";
import { AddManifestModal } from "../components/molecules/AddManifestModal";
import { Button } from "../components/atoms/Button";
import { AddIcon } from "../components/icons/AddIcon";
import { ThumbnailStrip } from "../components/organisms/ThumbnailStrip";

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
        <h1 className={styles.title}>Manifest Editor </h1>

        <Button onClick={() => setModalVisible(!modalVisible)}>
          <AddIcon />
        </Button>
        {modalVisible ? (
          <AddManifestModal
            manifest={manifest}
            onChange={setManifest}
            close={() => setModalVisible(false)}
          />
        ) : (
          <></>
        )}

        <VaultProvider>
          <SimpleViewerProvider manifest={manifest}>
            <ThumbnailStrip />
          </SimpleViewerProvider>
        </VaultProvider>
      </main>

      {/* <footer className={styles.footer}>
      </footer> */}
    </div>
  );
};

export default Home;
