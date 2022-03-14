import { useThumbnail } from "react-iiif-vault";
import styled from "styled-components";

export const ThumbnailImg = styled.img`
   {
    margin: 0.375rem;
    object-fit: contain;
    cursor: pointer;
  }
`;

export const Thumbnail: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const thumb = useThumbnail({
    maxHeight: 300,
    maxWidth: 300,
  });

  if (!thumb) {
    return null;
  }

  return (
    <ThumbnailImg src={thumb.id} alt="" loading="lazy" onClick={onClick} />
  );
};
