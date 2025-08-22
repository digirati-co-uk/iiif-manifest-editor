import { getValue } from "@iiif/helpers";
import { isSpecificResource } from "@iiif/parser";
import type { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { useHoverHighlightImageResource } from "@manifest-editor/shell";
import { ThumbnailImg } from "@manifest-editor/ui/atoms/Thumbnail";
import { ThumbnailContainer } from "@manifest-editor/ui/atoms/ThumbnailContainer";
import { RichMediaLink } from "@manifest-editor/ui/components/organisms/RichMediaLink/RichMediaLink";
import {
  AnnotationContext,
  LocaleString,
  targetIntersects,
  useAnnotation,
  useRenderingStrategy,
} from "react-iiif-vault";
import { getAnnotationType } from "../../helpers/get-annotation-type";
import { useAnnotationThumbnail } from "../../hooks/useAnnotationThumbnail";
import { HTMLAnnotationBodyRender } from "@manifest-editor/components";
import { Button } from "react-aria-components";

function AnnotationImageThumbnail() {
  const thumbnail = useAnnotationThumbnail();

  return thumbnail ? (
    <ThumbnailContainer $size={40}>
      <ThumbnailImg src={thumbnail.id} alt="thumbnail" />
    </ThumbnailContainer>
  ) : null;
}

function AnnotationImageType() {
  const [strategy] = useRenderingStrategy({ enableSingleAnnotation: true });
  const [, label] = getAnnotationType(strategy);

  return <span>{label}</span>;
}

export function AnnotationTargetLabel({ id }: { id: string }) {
  const annotation = useAnnotation({ id });

  if (annotation && annotation.label) {
    return <LocaleString>{annotation.label}</LocaleString>;
  }

  return <>Untitled annotation</>;
}

export function AnnotationPreview({
  onClick,
  margin,
  viewport,
}: {
  onClick?: (annotation: AnnotationNormalized) => void;
  margin?: boolean;
  viewport?: { width: number; height: number; x: number; y: number } | null;
}) {
  const annotation = useAnnotation();
  const highlightProps = useHoverHighlightImageResource(annotation?.id);

  if (!annotation) {
    return null;
  }

  const body = annotation?.body;
  const firstBody = (body || [])[0] as any;
  const item = isSpecificResource(firstBody) ? firstBody.source : firstBody;

  const isValid = item && (item.type === "Image" || item.type === "Sound" || item.type === "Video");
  const annotationTarget =
    (annotation as any)?.target.source?.type === "Annotation" ? (annotation as any)?.target.source?.id : null;

  const annoSelector = (annotation.target as any)?.selector;
  const boxSelector = annoSelector?.type === "BoxSelector" ? annoSelector.spatial : null;
  const isVisible = viewport && boxSelector ? targetIntersects(viewport, boxSelector) : true;

  if (!firstBody || firstBody.type === "TextualBody") {
    return (
      <Button
        className="border border-gray-300 text-left hover:border-me-500 w-full shadow-sm rounded bg-white relative mb-2"
        onPress={
          onClick
            ? (e) => {
                onClick(annotation);
              }
            : undefined
        }
      >
        {firstBody ? (
          <HTMLAnnotationBodyRender
            className="px-3 pt-3 prose-p:text-slate-600"
            locale="en"
          />
        ) : (
            <div className="flex items-center justify-center px-4 py-6 text-gray-400 text-sm">
              This annotation has no body.
            </div>
          )
        }
      </Button>
    )
  }

  return (
    <>
      <RichMediaLink
        isVisible={isVisible}
        margin={margin}
        title={
          annotation.label ? (
            getValue(annotation.label)
          ) : isValid ? (
            <AnnotationImageType />
          ) : item?.type || annotationTarget ? (
            <AnnotationTargetLabel id={annotationTarget} />
          ) : (
            firstBody?.value
          )
        }
        icon={
          isValid ? (
            <AnnotationImageThumbnail />
          ) : annotationTarget ? (
            <AnnotationContext annotation={annotationTarget}>
              <AnnotationImageThumbnail />
            </AnnotationContext>
          ) : null
        }
        noLink
        link={annotationTarget ? "Targets painting annotation" : item?.id || annotation.id}
        label={item?.format || (annotation?.motivation ? annotation.motivation : item?.type)}
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
