import { useState } from "react";
import type, { NextPage } from "next";
import Head from "next/head";
import {
  VaultProvider,
  SimpleViewerProvider,
} from "@hyperion-framework/react-vault";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  // const vault = new Vault();

  // vault.loadManifest('https://view.nls.uk/manifest/1227/7148/122771487/manifest.json').then(manifest => {
  //   // Note: manifest here is flattened. You need to call: vault.fromRef() or vault.allFromRef
  //   const canvasRef = manifest?.items[0]; // { id: 'http://...', type: 'Canvas' }
  //   const fullCanvas = vault.fromRef(canvasRef); // { id: '..', type: '', items: [], ... }
  //   const allCanvases = vault.allFromRef(manifest?.items); // [{ id: '..', type: '', items: [], ... }, ...]
  //   console.log(fullCanvas);
  // });
  const [manifestIndex, setManifestIndex] = useState(0);

  return (
    <div className={styles.container}>
      <Head>
        <title>Manifest Editor</title>
        <meta name="description" content="IIIF Manifest Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <VaultProvider>
            <SimpleViewerProvider
              manifest={
                "https://view.nls.uk/manifest/1227/7148/122771487/manifest.json"
              }
            >
            </SimpleViewerProvider>
          </VaultProvider>
        </h1>
      </main>

      {/* <footer className={styles.footer}>
      </footer> */}
    </div>
  );
};

export default Home;
