import { useState } from "react";
import { useThumbnail } from "react-iiif-vault";
import styled from "styled-components";
import { FlexContainer } from "../components/layout/FlexContainer";
import { BlockIcon } from "../icons/BlockIcon";
import { ErrorBoundary } from "./ErrorBoundary";
import { PaddingComponentSmall } from "./PaddingComponent";
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
    unsafeImageService: true,
  });

  if (!thumb || (thumb as any).width > (width || 128)) {
    return (
      <TemplateCardContainer onClick={onClick}>
        <BlockIcon color="grey" />
        <PaddingComponentSmall />
        No thumbnail
      </TemplateCardContainer>
    );
  }

  return (
    <div key={`${width + thumb.id}`}>
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
            <RecentLabel>ERROR</RecentLabel>
          </TemplateCardContainer>
        )}
      </ErrorBoundary>
    </div>
  );
};
