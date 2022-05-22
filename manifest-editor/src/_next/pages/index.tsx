import { Shell } from "../../apps/Shell/Shell";
import { IIIFBrowser } from "../../apps/IIIFBrowser/IIIFBrowser";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ManifestEditor } from "../../apps/ManifestEditor/ManifestEditor";
import { Splash } from "../../apps/Splash/Splash";
import styled, { ThemeProvider } from "styled-components";
import { useShell } from "../../context/ShellContext/ShellContext";
import { useManifest } from "react-iiif-vault";
import { ManifestEditorProvider } from "../../apps/ManifestEditor/ManifestEditor.context";
import { Fragment } from "react";
import { RenderApp } from "./render-app";

const Main = styled.main`
   {
    height: 100vh;
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

const Container = styled.div``;

const IndexPage = (props: any) => {
  const { selectedApplication } = useShell();
  const manifest = useManifest();

  return (
    <Container>
      <ThemeProvider theme={props.theme}>
        <ErrorBoundary>
          <Main>
            <Shell previewConfig={props.config.preview} newTemplates={props.templates} />
            <ManifestEditorProvider
              defaultLanguages={props.config.defaultLanguages}
              behaviorProperties={props.config.behaviorPresets}
            >
              {selectedApplication === "ManifestEditor" ? (
                <ManifestEditor
                  // @todo Removing this, and the <ManifestEditor /> not loading, this is a bug.
                  key={manifest?.id}
                />
              ) : (
                <Fragment />
              )}
            </ManifestEditorProvider>
            {selectedApplication === "Browser" && <IIIFBrowser />}
            {selectedApplication === "Splash" && <Splash welcome={props.welcome} />}

            <RenderApp selectedApplication={selectedApplication} />
          </Main>
        </ErrorBoundary>
        {/*<footer className={styles.footer}></footer>*/}
      </ThemeProvider>
    </Container>
  );
};

export default IndexPage;
