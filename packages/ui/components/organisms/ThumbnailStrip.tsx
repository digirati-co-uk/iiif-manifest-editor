import { CanvasContext, useManifest } from "react-iiif-vault";

import { SmallThumbnailStripContainer, ThumbnailContainer } from "../../atoms/ThumbnailContainer";
import { Thumbnail } from "../../atoms/Thumbnail";
import { useManifestEditor } from "../../apps/ManifestEditorLegacy/ManifestEditor.context";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";

import { RecentLabel } from "../../atoms/RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew } from "../../atoms/TemplateCard";
import { AddIcon } from "../../icons/AddIcon";
import { FlexContainer } from "../layout/FlexContainer";
import { CanvasThumbnail } from "./CanvasThumbnail/CanvasThumbnail";

export const ThumbnailStrip: React.FC<{ handleChange: (id: string) => void; width?: number }> = ({
  handleChange,
  width,
}) => {
  const manifest = useManifest();
  // const editorContext = useManifestEditor();

  // if (!manifest || !manifest.items || manifest.items.length <= 0) {
  //   return (
  //     <ThumbnailContainer>
  //       <FlexContainer style={{ justifyContent: "flex-start", width: "100%" }}>
  //         <TemplateCardContainer onClick={() => editorContext?.setAddCanvasModalOpen(true)}>
  //           <TemplateCardNew>
  //             <AddIcon />
  //           </TemplateCardNew>
  //           <RecentLabel>Add</RecentLabel>
  //         </TemplateCardContainer>
  //       </FlexContainer>
  //     </ThumbnailContainer>
  //   );
  // }

  return (
    <ThumbnailContainer>
      {manifest?.items.map((item: any) => {
        return (
          <CanvasContext key={item.id} canvas={item.id}>
            <ErrorBoundary>
              <CanvasThumbnail onClick={() => handleChange(item.id)} size={width} />
            </ErrorBoundary>
          </CanvasContext>
        );
      })}
    </ThumbnailContainer>
  );
};

export const SmallThumbnailStrip: React.FC<{ handleChange: (id: string) => void; width?: number }> = ({
  handleChange,
  width,
}) => {
  const manifest = useManifest();

  return (
    <SmallThumbnailStripContainer>
      {manifest?.items.map((item: any) => {
        return (
          <ErrorBoundary>
            <CanvasContext key={item.id} canvas={item.id}>
              <ErrorBoundary>
                <CanvasThumbnail onClick={() => handleChange(item.id)} size={width} />
              </ErrorBoundary>
            </CanvasContext>
          </ErrorBoundary>
        );
      })}
    </SmallThumbnailStripContainer>
  );
};
