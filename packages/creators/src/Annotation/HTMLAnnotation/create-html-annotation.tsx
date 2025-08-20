import { getValue } from "@iiif/helpers";
import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, HTMLEditor } from "@manifest-editor/components";
import {
  type CreatorContext,
  type CreatorFunctionContext,
  useAnnotationCreatorState,
} from "@manifest-editor/creator-api";
import { LanguageFieldEditor } from "@manifest-editor/editors";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { useState } from "react";
import { useCurrentAnnotationMetadata } from "react-iiif-vault";

export interface CreateHTMLAnnotationPayload {
  label?: InternationalString;
  body: InternationalString;
  motivation?: string;
  height?: number;
  width?: number;
}

export async function createHtmlAnnotation(
  data: CreateHTMLAnnotationPayload,
  ctx: CreatorFunctionContext,
) {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };

  const targetType = ctx.options.targetType as "Annotation" | "Canvas";

  const languages = Object.keys(data.body);
  const bodies = [];
  for (const language of languages) {
    const body = (data.body as any)[language].join("\n");
    if (body) {
      bodies.push(
        await ctx.create(
          "@manifest-editor/html-body-creator",
          {
            language,
            body,
          },
          { parent: { resource: annotation, property: "items" } },
        ),
      );
    }
  }

  if (targetType === "Annotation") {
    return ctx.embed({
      ...annotation,
      motivation:
        data.motivation || ctx.options.initialData?.motivation || "painting",
      body: bodies,
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
      body: bodies,
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
      height: data.height || 1000,
      width: data.width || 1000,
      items: [page],
    });
  }
}

export function CreateHTMLAnnotation(
  props: CreatorContext<CreateHTMLAnnotationPayload>,
) {
  const [body, setBody] = useAnnotationCreatorState<InternationalString>({
    key: "bodyValue",
    initialValue: { en: [""] },
    requestId: props.options.initialData?.requestId,
  });

  const isEmpty = getValue(body).trim() === "";

  const onSubmit = () => {
    props.runCreate({
      body,
    });
  };

  return (
    <>
      <HTMLEditor
        className="border-none"
        value={body.en?.[0] || ""}
        onChange={(newValue) => setBody({en: [newValue]})}
      />

      <ActionButton
        primary
        type="button"
        onPress={onSubmit}
        isDisabled={isEmpty}
      >
        Create
      </ActionButton>
    </>
  );
}
