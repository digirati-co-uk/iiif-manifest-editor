import { getValue } from "@iiif/vault-helpers";
import { useThumbnail } from "react-iiif-vault";
import styled from "styled-components";
import { AddIcon } from "../icons/AddIcon";
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
  const thumb = useThumbnail({
    minWidth: 200,
    minHeight: 200,
    maxWidth: 300,
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
    <ErrorBoundary>
      <ThumbnailImg
        src={thumb.id}
        alt=""
        loading="lazy"
        onClick={onClick}
        draggable="false"
      />
    </ErrorBoundary>
  );
};
