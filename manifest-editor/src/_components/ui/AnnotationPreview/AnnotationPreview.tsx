import { useAnnotation, useRenderingStrategy } from "react-iiif-vault";
import { useAnnotationThumbnail } from "@/hooks/useAnnotationThumbnail";
import { RichMediaLink } from "@/components/organisms/RichMediaLink/RichMediaLink";
import { ThumbnailImg } from "@/atoms/Thumbnail";
import { ThumbnailContainer } from "@/atoms/ThumbnailContainer";
import { AnnotationNormalized } from "@iiif/presentation-3";
import { useHoverHighlightImageResource } from "@/state/highlighted-image-resources";
import { getAnnotationType } from "@/helpers/get-annotation-type";

export function AnnotationPreview({ onClick }: { onClick?: (annotation: AnnotationNormalized) => void }) {
  const annotation = useAnnotation();
  const thumbnail = useAnnotationThumbnail();
  const highlightProps = useHoverHighlightImageResource(annotation?.id);
  const [strategy] = useRenderingStrategy({ enableSingleAnnotation: true });
  const [, label] = getAnnotationType(strategy);

  if (!annotation) {
    return null;
  }

  const body = annotation?.body;
  const firstBody = body[0] as any;

  return (
    <>
      <RichMediaLink
        title={label}
        icon={
          thumbnail ? (
            <ThumbnailContainer size={40}>
              <ThumbnailImg src={thumbnail.id} alt="thumbnail" />
            </ThumbnailContainer>
          ) : null
        }
        link={annotation.body[0].id}
        label={firstBody?.format || firstBody?.type}
        iconLabel="Icon label"
        onClick={
          onClick
            ? (e) => {
                e.preventDefault();
                onClick(annotation);
              }
            : undefined
        }
        containerProps={highlightProps}
      />
    </>
  );
}
