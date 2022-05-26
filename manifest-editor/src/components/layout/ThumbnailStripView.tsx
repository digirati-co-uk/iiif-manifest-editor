import styled from "styled-components";
import { ThumbnailStrip } from "../organisms/ThumbnailStrip";
import { Tree } from "../../navigation/tree/Tree";
import { ViewSelector } from "../../atoms/ViewSelector";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { useAppState } from "../../shell/AppContext/AppContext";

const ContentSelectorContainer = styled.div`
   {
    display: flex;
    flex-direction: column;
    border-right: 0.016rem solid #dddddd;
    justify-content: space-between;
    align-items: center;
    margin: 0.375rem 0;
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"} 0;
    height: 80vh;
    @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
      width: 100%;
      border-right: none;
      max-height: 30%;
    }
  }
`;

export const ThumbnailStripView: React.FC<{
  view: "tree" | "thumbnails" | "grid" | "noNav" | "fullEditor";
}> = ({ view }) => {
  const editorContext = useManifestEditor();
  const appState = useAppState();

  const handleChange = (itemId: string) => {
    appState.setState({ canvasId: itemId });
    editorContext?.changeSelectedProperty("canvas");
  };

  return (
    <>
      {(view === "thumbnails" || view === "tree") && (
        <ContentSelectorContainer>
          {view === "thumbnails" && <ThumbnailStrip handleChange={handleChange} />}
          {view === "tree" && <Tree />}
          <ViewSelector />
        </ContentSelectorContainer>
      )}
    </>
  );
};
