import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Shell } from "../components/apps/Shell/Shell";
import { IIIFBrowser } from "../components/apps/IIIFBrowser/IIIFBrowser";
import { ErrorBoundary } from "../components/atoms/ErrorBoundary";
import { ManifestEditor } from "../components/apps/ManifestEditor/ManifestEditor";

import data from "../config.json";


export const getStaticProps = async () => {
  return {
    props: {
      config: data,
    },
  };
};

const Home: NextPage = (props: any) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Manifest Editor</title>
        <meta name="description" content="IIIF Manifest Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ErrorBoundary>
        <main className={styles.main}>
          <Shell previewConfig={props.config.preview} />
          {props.selectedApplication === "ManifestEditor" && (
            <ManifestEditor defaultLanguages={props.config.defaultLanguages} />
          )}
          {props.selectedApplication === "Browser" && <IIIFBrowser />}
        </main>
      </ErrorBoundary>
      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
