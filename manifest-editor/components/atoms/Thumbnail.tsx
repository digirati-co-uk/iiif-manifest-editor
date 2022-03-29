import { useThumbnail } from "react-iiif-vault";
import styled from "styled-components";
import { ErrorBoundary } from "./ErrorBoundary";

export const ThumbnailImg = styled.img`
   {
    margin: 0.375rem;
    object-fit: contain;
    padding: 10px;
  }
`;

export const Thumbnail: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  let thumb: any;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    thumb = useThumbnail({
      minWidth: 200,
      minHeight: 200,
      maxWidth: 300,
    });
  } catch (error) {
    console.warn(error);
  }

  if (!thumb) {
    return <div onClick={onClick}>No Thumbnail</div>;
  }

  return (
    <ErrorBoundary>
      <ThumbnailImg src={thumb.id} alt="" loading="lazy" onClick={onClick} />
    </ErrorBoundary>
  );
};
