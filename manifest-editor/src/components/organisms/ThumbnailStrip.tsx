import { CanvasContext, useManifest } from "react-iiif-vault";

import { SmallThumbnailStripContainer, ThumbnailContainer } from "../../atoms/ThumbnailContainer";
import { Thumbnail } from "../../atoms/Thumbnail";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { useShell } from "../../context/ShellContext/ShellContext";
import { RecentLabel } from "../../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../../atoms/TemplateCard";
import { AddIcon } from "../../icons/AddIcon";
import { FlexContainer } from "../layout/FlexContainer";

export const ThumbnailStrip: React.FC = () => {
  const manifest = useManifest();
  const editorContext = useManifestEditor();
  const shellContext = useShell();

  const handleChange = (itemId: string) => {
    shellContext.setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty("canvas");
  };

  if (!manifest || !manifest.items || manifest.items.length <= 0) {
    return (
      <ThumbnailContainer>
        <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
          <TemplateCardContainer onClick={() => editorContext?.setAddCanvasModalOpen(true)}>
            <TemplateCardNew>
              <AddIcon />
            </TemplateCardNew>
            <RecentLabel>Add</RecentLabel>
          </TemplateCardContainer>
        </FlexContainer>
      </ThumbnailContainer>
    );
  }

  return (
    <ThumbnailContainer>
      {manifest?.items.map((item: any) => {
        return (
          <CanvasContext key={item.id} canvas={item.id}>
            <ErrorBoundary>
              <Thumbnail onClick={() => handleChange(item.id)} />
            </ErrorBoundary>
          </CanvasContext>
        );
      })}
    </ThumbnailContainer>
  );
};

export const SmallThumbnailStrip: React.FC = () => {
  const manifest = useManifest();
  const shellContext = useShell();
  const editorContext = useManifestEditor();

  const handleChange = (itemId: string) => {
    shellContext.setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty("canvas");
  };

  return (
    <SmallThumbnailStripContainer>
      {manifest?.items.map((item: any) => {
        return (
          <ErrorBoundary>
            <CanvasContext key={item.id} canvas={item.id}>
              <ErrorBoundary>
                <Thumbnail onClick={() => handleChange(item.id)} />
              </ErrorBoundary>
            </CanvasContext>
          </ErrorBoundary>
        );
      })}
    </SmallThumbnailStripContainer>
  );
};
