import { Shell } from "../../apps/Shell/Shell";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ManifestEditor } from "../../apps/ManifestEditor/ManifestEditor";
import styled, { ThemeProvider } from "styled-components";
import { useManifest } from "react-iiif-vault";
import { ManifestEditorProvider } from "../../apps/ManifestEditor/ManifestEditor.context";
import { Fragment } from "react";
import { RenderApp } from "./render-app";
import { AppStateProvider, useApps } from "../../shell/AppContext/AppContext";

const Main = styled.main`
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const IndexPage = (props: any) => {
  const { currentApp } = useApps();
  const selectedApplication = currentApp?.id;
  const manifest = useManifest();

  return (
    <Main>
      <ManifestEditorProvider>
        {selectedApplication === "manifest-editor" ? (
          <AppStateProvider appId="manifest-editor">
            <Shell previewConfig={props.config.preview} />
            <ManifestEditor
              // @todo Removing this, and the <ManifestEditor /> not loading, this is a bug.
              key={manifest?.id}
            />
          </AppStateProvider>
        ) : (
          <Fragment />
        )}
      </ManifestEditorProvider>

      {/* All that is required for rendering app. */}
      <RenderApp />
    </Main>
  );
};

export default IndexPage;
