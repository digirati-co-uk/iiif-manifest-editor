import { useThumbnail } from "react-iiif-vault";
import styled from "styled-components";
import { ErrorBoundary } from "./ErrorBoundary";

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
    return <div onClick={onClick}>No Thumbnail</div>;
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
