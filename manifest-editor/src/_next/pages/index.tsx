import { Shell } from "../../apps/Shell/Shell";
import { IIIFBrowser } from "../../apps/IIIFBrowser/IIIFBrowser";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ManifestEditor } from "../../apps/ManifestEditor/ManifestEditor";
import { Splash } from "../../apps/Splash/Splash";
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

const IndexPage = (props: any) => {
  return (
    <Container>
      <ThemeProvider theme={props.theme}>
        <ErrorBoundary>
          <Main>
            <Shell previewConfig={props.config.preview} newTemplates={props.templates} />
            {props.selectedApplication === "ManifestEditor" && (
              <ManifestEditor
                defaultLanguages={props.config.defaultLanguages}
                behaviorProperties={props.config.behaviorPresets}
              />
            )}
            {props.selectedApplication === "Browser" && <IIIFBrowser />}
            {props.selectedApplication === "Splash" && <Splash welcome={props.welcome} />}
          </Main>
        </ErrorBoundary>
        {/*<footer className={styles.footer}></footer>*/}
      </ThemeProvider>
    </Container>
  );
};

export default IndexPage;
