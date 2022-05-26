import { useContext, useState } from "react";
import { useThumbnail } from "react-iiif-vault";
import styled from "styled-components";
import { useManifestEditor } from "../apps/ManifestEditor/ManifestEditor.context";
import { ErrorBoundary } from "./ErrorBoundary";
import { RecentLabel } from "./RecentFilesWidget";
import { TemplateCardContainer, TemplateCardNew, TemplateCardPlaceholder } from "./TemplateCard";

export const ThumbnailImg = styled.img`
   {
    object-fit: contain;
    user-select: none;
  }
`;

export const Thumbnail: React.FC<{ onClick: () => void; width?: number; height?: number }> = ({
  onClick,
  width,
  height,
}) => {
  const [error, setError] = useState(false);

  const thumb = useThumbnail({
    maxWidth: width || 128,
    maxHeight: height ? height : typeof width !== "undefined" ? width : 128,
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
    <div key={`${width}`}>
      <ErrorBoundary>
        {!error && (
          <ThumbnailImg
            src={thumb.id}
            alt=""
            loading="lazy"
            onClick={onClick}
            draggable="false"
            height={width || 256}
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
