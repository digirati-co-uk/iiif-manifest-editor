import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Shell } from "../components/apps/Shell/Shell";
import { IIIFBrowser } from "../components/apps/IIIFBrowser/IIIFBrowser";
import { ErrorBoundary } from "../components/atoms/ErrorBoundary";
import { ManifestEditor } from "../components/apps/ManifestEditor/ManifestEditor";

import data from "../config.json";
import { Theme } from "../styles/theme";
import styled, { ThemeProvider } from "styled-components";

const Main = styled.main`
   {
    height: 100vh;
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

const Container = styled.div`
   {
    padding: 0 1rem;
  }
`;

export const getStaticProps = async () => {
  return {
    props: {
      config: data,
      theme: Theme,
    },
  };
};

const Home: NextPage = (props: any) => {
  return (
    <Container>
      <ThemeProvider theme={props.theme}>
        <Head>
          <title>Manifest Editor</title>
          <meta name="description" content="IIIF Manifest Editor" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ErrorBoundary>
          <Main>
            <Shell previewConfig={props.config.preview} />
            {props.selectedApplication === "ManifestEditor" && (
              <ManifestEditor
                defaultLanguages={props.config.defaultLanguages}
              />
            )}
            {props.selectedApplication === "Browser" && <IIIFBrowser />}
          </Main>
        </ErrorBoundary>
        <footer className={styles.footer}></footer>
      </ThemeProvider>
    </Container>
  );
};

export default Home;
