import { useContext } from "react";
import { useThumbnail } from "../../hooks/useThumbnail";
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
    margin: 0.375rem;
    object-fit: contain;
    padding: 10px;
    user-select: none;
  }
`;

export const Thumbnail: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const editorContext = useContext(ManifestEditorContext);

  const thumb = useThumbnail({
    maxWidth: editorContext?.thumbnailSize?.w || 256,
    maxHeight: editorContext?.thumbnailSize?.h || 256,
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
        <ThumbnailImg
          src={thumb.id}
          alt=""
          loading="lazy"
          onClick={onClick}
          draggable="false"
          height={editorContext?.thumbnailSize?.h || 256}
        />
      </ErrorBoundary>
    </div>
  );
};
