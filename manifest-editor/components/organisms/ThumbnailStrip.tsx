import { CanvasContext, useManifest } from "react-iiif-vault";

import {
  SmallThumbnailStripContainer,
  ThumbnailContainer,
} from "../atoms/ThumbnailContainer";
import { Thumbnail } from "../atoms/Thumbnail";
import { useContext } from "react";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import ShellContext from "../apps/Shell/ShellContext";
import { RecentLabel } from "../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../atoms/TemplateCard";
import { ViewSelector } from "../atoms/ViewSelector";
import { AddIcon } from "../icons/AddIcon";
import { FlexContainer } from "../layout/FlexContainer";

// The CanvasContext currently only lets you select every second canvas. Once the
// SimpleViewerProvider && SimpleViewerContext from react-iiif-vault
// get updated with the latest code they will accept a prop pagingView={false}

export const ThumbnailStrip: React.FC = () => {
  const manifest = useManifest();
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);

  const handleChange = (itemId: string) => {
    shellContext?.setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty("canvas");
  };

  if (!manifest || !manifest.items || manifest.items.length <= 0) {
    return (
      <ThumbnailContainer>
        <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
          <TemplateCardContainer
            onClick={() => editorContext?.setAddCanvasModalOpen(true)}
          >
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
  const shellContext = useContext(ShellContext);
  const editorContext = useContext(ManifestEditorContext);

  const handleChange = (itemId: string) => {
    shellContext?.setCurrentCanvasId(itemId);
    editorContext?.changeSelectedProperty("canvas");
  };

  return (
    <SmallThumbnailStripContainer>
      {manifest?.items.map((item: any) => {
        return (
          <ErrorBoundary>
            <CanvasContext key={item.id} canvas={item.id}>
              <Thumbnail onClick={() => handleChange(item.id)} />
            </CanvasContext>
          </ErrorBoundary>
        );
      })}
    </SmallThumbnailStripContainer>
  );
};
