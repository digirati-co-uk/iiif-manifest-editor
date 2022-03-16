import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Shell } from "../components/apps/Shell/Shell";
import { IIIFBrowser } from "../components/apps/IIIFBrowser/IIIFBrowser";
import { ErrorBoundary } from "../components/atoms/ErrorBoundary";
import { ManifestEditor } from "../components/apps/ManifestEditor/ManifestEditor";
import { Splash } from "../components/apps/Splash/Splash";
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
  const fs = require("fs");
  const path = require("path").join(process.cwd(), "/public/welcome.html");
  const welcome = await fs.readFileSync(path, "utf-8");

  return {
    props: {
      config: data,
      theme: Theme,
      welcome: welcome,
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
          <script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest" />
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
            {props.selectedApplication === "Splash" && (
              <Splash welcome={props.welcome} />
            )}
          </Main>
        </ErrorBoundary>
        <footer className={styles.footer}></footer>
      </ThemeProvider>
    </Container>
  );
};

export default Home;
