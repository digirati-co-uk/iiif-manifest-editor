import { useVault } from "react-iiif-vault";
import { ThumbnailImg } from "@/atoms/Thumbnail";
import { ThumbnailContainer } from "@/atoms/ThumbnailContainer";
import { FlexContainer, FlexContainerColumn } from "@/components/layout/FlexContainer";
import { useHoverHighlightImageResource } from "@/state/highlighted-image-resources";
import { createThumbnailHelper } from "@iiif/vault-helpers";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAnnotationThumbnail } from "@/hooks/useAnnotationThumbnail";

interface MediaResourceEditorProps {
  thumbnailSrc: string;
}

export const MediaResourcePreview: React.FC<MediaResourceEditorProps> = ({ thumbnailSrc }) => {
  const vault = useVault();
  const image = vault.get(thumbnailSrc) as any;
  const props = useHoverHighlightImageResource(thumbnailSrc);
  const thumbnail = useAnnotationThumbnail({ annotationId: thumbnailSrc });

  return (
    <>
      {image &&
        image?.body &&
        Array.isArray(image.body) &&
        image.body.map((annotationBody: any) => {
          const body = vault.get(annotationBody.id) as any;
          return (
            <FlexContainer
              style={{
                alignItems: "center",
                width: "100%",
              }}
              key={thumbnailSrc}
              {...props}
            >
              <FlexContainerColumn>
                {thumbnail && (
                  <ThumbnailContainer size={32}>
                    <ThumbnailImg src={thumbnail.id} alt="thumbnail" />
                  </ThumbnailContainer>
                )}
              </FlexContainerColumn>
              <div style={{ padding: "10px" }}>{body.type}</div>
            </FlexContainer>
          );
        })}
    </>
  );
};
