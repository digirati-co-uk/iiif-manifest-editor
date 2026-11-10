import { useTranslations } from "@manifest-editor/i18n";
import { getValue } from "@iiif/helpers";
import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, ErrorMessage, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { DimensionsTriplet, Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { VideoPlayer } from "@manifest-editor/ui/VideoPlayer";
import { useEffect, useState } from "react";

export interface CreateVideoAnnotationPayload {
  label?: InternationalString;
  motivation?: string;
  duration?: number;
  url: string;
  width: number;
  height: number;
}

export async function createVideoAnnotation(data: CreateVideoAnnotationPayload, ctx: CreatorFunctionContext) {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };

  const targetType = ctx.options.targetType as "Annotation" | "Canvas";

  const body = ctx.embed({
    id: data.url,
    type: "Video",
    format: "video/mp4",
    width: data.width,
    height: data.height,
    duration: data.duration || 0,
  });

  if (targetType === "Annotation") {
    return ctx.embed({
      ...annotation,
      label: getValue(data.label) && data.label,
      motivation: data.motivation || ctx.options.initialData?.motivation || "painting",
      body,
      target: ctx.getTarget(),
    });
  }

  if (targetType === "Canvas") {
    const canvasId = ctx.generateId("canvas");
    const pageId = ctx.generateId("annotation-page", {
      id: canvasId,
      type: "Canvas",
    });

    const annotationResource = ctx.embed({
      ...annotation,
      motivation: "painting",
      body,
      target: {
        type: "SpecificResource",
        source: { id: canvasId, type: "Canvas" },
      },
    });

    const page = ctx.embed({
      id: pageId,
      type: "AnnotationPage",
      items: [annotationResource],
    });

    return ctx.embed({
      id: canvasId,
      type: "Canvas",
      label: getValue(data.label) ? data.label : undefined,
      duration: data.duration || 0,
      width: data.width,
      height: data.height,
      items: [page],
    });
  }
}

export function CreateVideoAnnotationForm(props: CreatorContext<CreateVideoAnnotationPayload>) {
  const property = useTranslations("editor-api");
  const t = useTranslations("creators");
  const [initialData] = useState(() => props.options.initialData as Partial<CreateVideoAnnotationPayload>);
  const [url, setUrl] = useState(initialData.url || "");
  const [duration, setDuration] = useState(initialData.duration || 0);
  const [width, setWidth] = useState(initialData.width || 0);
  const [height, setHeight] = useState(initialData.height || 0);
  const [error, setError] = useState("");
  const [label, setLabel] = useState(initialData.label || ({ en: [""] } as InternationalString));

  const onSubmit = () => {
    props.runCreate({
      url,
      duration,
      label,
      width,
      height,
    });
  };

  useEffect(() => {
    setError("");
    const seed = url === initialData.url ? initialData : {};
    setDuration(seed.duration || 0);
    setWidth(seed.width || 0);
    setHeight(seed.height || 0);
    if (url) {
      // Find label from url.
      const labelFromUrl = url.split("/").pop()?.split(".").shift();
      setLabel(url === initialData.url && initialData.label ? initialData.label : { en: [labelFromUrl || ""] });
    }
  }, [url, initialData]);

  return (
    <PaddedSidebarContainer>
      {error ? (
        <ErrorMessage>
          <div role="alert">{t("errors.media")}</div>
          <details>
            <summary>{t("errors.details")}</summary>
            {error}
          </details>
        </ErrorMessage>
      ) : null}

      <InputContainer $wide>
        <InputLabel htmlFor="video-url">{t("form.videoUrl")}</InputLabel>
        <Input
          type="url"
          placeholder="https://example.org/video.mp4"
          id="video-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </InputContainer>

      {url && !error ? (
        <div>
          <LanguageFieldEditor
            key={`${url}__${duration}`}
            containerId={"label"}
            focusId={"label_"}
            label={property("fields.label")}
            fields={label}
            onSave={(e: any) => setLabel(e.toInternationalString())}
          />
        </div>
      ) : null}

      {url && !error ? (
        <div className="mb-4 bg-black">
          <VideoPlayer
            duration={duration}
            onDuration={(d) => setDuration(d)}
            onError={(err) => setError(err)}
            media={
              {
                url,
                duration,
                height,
                width,
                type: "Video",
              } as any
            }
            onDimensions={(w, h) => {
              setWidth(w || 0);
              setHeight(h || 0);
            }}
          />
        </div>
      ) : null}

      {!error && (duration || width || height) ? (
        <InputContainer $wide>
          <DimensionsTriplet
            widthId={"width"}
            width={width || 0}
            changeWidth={(v) => setWidth(v)}
            heightId={"height"}
            height={height || 0}
            changeHeight={(v) => setHeight(v)}
            durationId={"duration"}
            duration={duration || 0}
            changeDuration={(v) => setDuration(v)}
          />
        </InputContainer>
      ) : null}

      <ActionButton primary large type="button" onPress={onSubmit} isDisabled={!url || !!error}>
        {t("form.addVideo")}
      </ActionButton>
    </PaddedSidebarContainer>
  );
}
