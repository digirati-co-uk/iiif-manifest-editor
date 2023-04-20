import { useAnnotation, useRenderingStrategy } from "react-iiif-vault";
import { useAnnotationThumbnail } from "@/hooks/useAnnotationThumbnail";
import { RichMediaLink } from "@/components/organisms/RichMediaLink/RichMediaLink";
import { ThumbnailImg } from "@/atoms/Thumbnail";
import { ThumbnailContainer } from "@/atoms/ThumbnailContainer";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { useHoverHighlightImageResource } from "@/state/highlighted-image-resources";
import { getAnnotationType } from "@/helpers/get-annotation-type";
import { isSpecificResource, toRef } from "@iiif/parser";
import { getValue } from "@iiif/vault-helpers";

function AnnotationImageThumbnail() {
  const thumbnail = useAnnotationThumbnail();
  return thumbnail ? (
    <ThumbnailContainer size={40}>
      <ThumbnailImg src={thumbnail.id} alt="thumbnail" />
    </ThumbnailContainer>
  ) : null;
}

function AnnotationImageType() {
  const [strategy] = useRenderingStrategy({ enableSingleAnnotation: true });
  const [, label] = getAnnotationType(strategy);

  return <span>{label}</span>;
}

export function AnnotationPreview({
  onClick,
  margin,
}: {
  onClick?: (annotation: AnnotationNormalized) => void;
  margin?: boolean;
}) {
  const annotation = useAnnotation();
  const highlightProps = useHoverHighlightImageResource(annotation?.id);

  if (!annotation) {
    return null;
  }

  const body = annotation?.body;
  const firstBody = body[0] as any;
  const item = isSpecificResource(firstBody) ? firstBody.source : firstBody;

  const isValid = item.type === "Image" || item.type === "Sound" || item.type === "Video";

  return (
    <>
      <RichMediaLink
        margin={margin}
        title={annotation.label ? getValue(annotation.label) : isValid ? <AnnotationImageType /> : item.type}
        icon={isValid ? <AnnotationImageThumbnail /> : null}
        link={item.id}
        label={item?.format || item?.type}
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
