import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { AnnotationContext, useAnnotation, useRenderingStrategy } from "react-iiif-vault";
import { useAnnotationThumbnail } from "@/hooks/useAnnotationThumbnail";
import { RichMediaLink } from "@/components/organisms/RichMediaLink/RichMediaLink";
import { ThumbnailImg } from "@/atoms/Thumbnail";
import { ThumbnailContainer } from "@/atoms/ThumbnailContainer";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { useHoverHighlightImageResource } from "@/state/highlighted-image-resources";
import { getAnnotationTypeMessage } from "@/helpers/get-annotation-type";
import { isSpecificResource, toRef } from "@iiif/parser";
import { getValue } from "@iiif/helpers";
import { LocaleString } from "@/atoms/LocaleString";

function AnnotationImageThumbnail() {
  const t = useTranslations("ui");
  const thumbnail = useAnnotationThumbnail();
  return thumbnail ? (
    <ThumbnailContainer $size={40}>
      <ThumbnailImg src={thumbnail.id} alt={t("thumbnail.alt")} />
    </ThumbnailContainer>
  ) : null;
}

function AnnotationImageType() {
  const [strategy] = useRenderingStrategy({ enableSingleAnnotation: true });
  const { resolveMessage } = useEditorI18n();
  const label = resolveMessage(getAnnotationTypeMessage(strategy));

  return <span>{label}</span>;
}

export function AnnotationTargetLabel({ id }: { id: string }) {
  const t = useTranslations("ui");
  const annotation = useAnnotation({ id });

  if (annotation && annotation.label) {
    return <LocaleString>{annotation.label}</LocaleString>;
  }

  return <>{t("annotation.untitled")}</>;
}

export function AnnotationPreview({
  onClick,
  margin,
}: {
  onClick?: (annotation: AnnotationNormalized) => void;
  margin?: boolean;
}) {
  const t = useTranslations("ui");
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

  return (
    <>
      <RichMediaLink
        margin={margin}
        title={
          annotation.label ? (
            getValue(annotation.label)
          ) : isValid ? (
            <AnnotationImageType />
          ) : item?.type || annotationTarget ? (
            <AnnotationTargetLabel id={annotationTarget} />
          ) : (
            t("annotation.untitled")
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
        link={annotationTarget ? t("annotation.targetPainting") : item?.id || annotation.id}
        label={item?.format || (annotation?.motivation ? annotation.motivation : item?.type)}
        iconLabel={t("annotation.icon")}
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
