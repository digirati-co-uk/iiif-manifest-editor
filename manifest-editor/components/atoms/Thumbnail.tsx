import { useContext, useState } from "react";
import { useThumbnail } from "react-iiif-vault";
import styled from "styled-components";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
import { ErrorBoundary } from "./ErrorBoundary";
import { RecentLabel } from "./RecentFilesWidget";
import {
  TemplateCardContainer,
  TemplateCardNew,
  TemplateCardPlaceholder,
} from "./TemplateCard";

export const ThumbnailImg = styled.img`
   {
    object-fit: contain;
    user-select: none;
  }
`;

export const Thumbnail: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const editorContext = useContext(ManifestEditorContext);
  const [error, setError] = useState(false);

  const thumb = useThumbnail({
    maxWidth: editorContext?.thumbnailSize?.w || 128,
    maxHeight: editorContext?.thumbnailSize?.h || 128,
  });

  if (!thumb) {
    return (
      <TemplateCardContainer onClick={onClick}>
        <TemplateCardNew>
          <TemplateCardPlaceholder />
        </TemplateCardNew>
        <RecentLabel>No thumbnail</RecentLabel>
      </TemplateCardContainer>
    );
  }

  return (
    <div key={editorContext?.thumbnailSize?.w}>
      <ErrorBoundary>
        {!error && (
          <ThumbnailImg
            src={thumb.id}
            alt=""
            loading="lazy"
            onClick={onClick}
            draggable="false"
            height={editorContext?.thumbnailSize?.h || 256}
            onError={() => setError(true)}
          />
        )}
        {error && (
          <TemplateCardContainer onClick={onClick}>
            <TemplateCardNew>
              <TemplateCardPlaceholder />
            </TemplateCardNew>
            <RecentLabel>No thumbnail</RecentLabel>
          </TemplateCardContainer>
        )}
      </ErrorBoundary>
    </div>
  );
};
