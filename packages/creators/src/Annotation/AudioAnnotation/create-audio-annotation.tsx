import type {
  CreatorContext,
  CreatorFunctionContext,
} from "@manifest-editor/creator-api";
import type { InternationalString } from "@iiif/presentation-3";
import { useEffect, useState } from "react";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { ErrorMessage } from "@manifest-editor/components";
import { MediaControls } from "@manifest-editor/ui/MediaControls";
import { CanvasPanel } from "react-iiif-vault";
import { getValue } from "@iiif/helpers";
import {
  Input,
  InputContainer,
  InputLabel,
  LanguageFieldEditor,
  FormFieldWrapper,
} from "@manifest-editor/editors";
import { Button } from "@manifest-editor/ui/atoms/Button";

export interface CreateAudioAnnotationPayload {
  label?: InternationalString;
  motivation?: string;
  duration?: number;
  url: string;
}

export async function createAudioAnnotation(
  data: CreateAudioAnnotationPayload,
  ctx: CreatorFunctionContext,
) {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };

  const targetType = ctx.options.targetType as "Annotation" | "Canvas";

  const body = await ctx.embed({
    id: data.url,
    type: "Sound",
    format: "audio/mp4",
    duration: data.duration || 0,
  });

  if (targetType === "Annotation") {
    return ctx.embed({
      ...annotation,
      label: getValue(data.label) && data.label,
      motivation:
        data.motivation || ctx.options.initialData?.motivation || "painting",
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
      label: data.label || { en: ["Untitled HTML canvas"] },
      duration: data.duration || 0,
      items: [page],
    });
  }
}

export function CreateAudioAnnotationForm(
  props: CreatorContext<CreateAudioAnnotationPayload>,
) {
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [label, setLabel] = useState({ en: [""] } as InternationalString);

  const onSubmit = () => {
    props.runCreate({
      url,
      duration,
      label,
    });
  };

  useEffect(() => {
    setError("");
    setDuration(0);
    if (url) {
      // Find label from url.
      const labelFromUrl = url.split("/").pop()?.split(".").shift();
      setLabel({ en: [labelFromUrl || ""] } as InternationalString);
    }
  }, [url]);

  return (
    <PaddedSidebarContainer>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

      <InputContainer>
        <InputLabel htmlFor="audio-url">URL</InputLabel>
        <Input
          type="text"
          id="audio-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </InputContainer>

      {url && !error ? (
        <div>
          <LanguageFieldEditor
            key={url + "__" + duration}
            containerId={"label"}
            focusId={"label_"}
            label={"Label"}
            fields={label}
            onSave={(e: any) => setLabel(e.toInternationalString())}
          />
        </div>
      ) : null}

      {url && !error ? (
        <CanvasPanel.AudioHTML
          key={url + "__" + duration}
          media={{ url, duration, type: "Sound" } as any}
        >
          <MediaControls
            key={url + "__" + duration}
            onError={(error) => setError(error)}
            onDuration={(duration) => setDuration(duration)}
          />
        </CanvasPanel.AudioHTML>
      ) : null}

      {duration && !error ? (
        <FormFieldWrapper>
          <InputLabel htmlFor="duration">Duration</InputLabel>
          <Input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.valueAsNumber)}
          />
        </FormFieldWrapper>
      ) : null}

      {url && !error && <Button onClick={onSubmit}>Add audio</Button>}
    </PaddedSidebarContainer>
  );
}
