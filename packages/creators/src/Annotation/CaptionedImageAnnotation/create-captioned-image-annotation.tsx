import type { InternationalString } from "@iiif/presentation-3";
import type {
  CreatorContext,
  CreatorFunctionContext,
} from "@manifest-editor/creator-api";
import {
  Input,
  InputContainer,
  InputLabel,
  LanguageFieldEditor,
} from "@manifest-editor/editors";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { type FormEvent, useState } from "react";

export interface CreateCaptionedImageAnnotationPayload {
  label?: InternationalString;
  body: InternationalString;
  imageUrl: string;
  motivation?: string;
  height?: number;
  width?: number;
}

export async function createCaptionedImageAnnotation(
  data: CreateCaptionedImageAnnotationPayload,
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

  const resource = await ctx.create(
    "@manifest-editor/image-url-creator",
    { url: data.imageUrl },
    {
      parent: { resource: annotation, property: "body" },
    },
  );

  if (resource) {
    bodies.push(resource);
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

  // @todo this might not make sense to be a canvas.
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

export function CreateCaptionedImageAnnotation(
  props: CreatorContext<CreateCaptionedImageAnnotationPayload>,
) {
  const [body, setBody] = useState<InternationalString>({ en: [""] });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    props.runCreate({
      body,
      imageUrl: formData.url,
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <PaddedSidebarContainer>
        <InputContainer>
          <InputContainer $wide>
            <InputLabel htmlFor="id">Link to Image</InputLabel>
            <Input id="url" name="url" defaultValue="" />
          </InputContainer>
        </InputContainer>

        <InputContainer>
          <InputLabel>Image Caption</InputLabel>
          <LanguageFieldEditor
            focusId={"html-content"}
            label={"HTML Content"}
            fields={body}
            onSave={(e: any) => setBody(e.toInternationalString())}
          />
        </InputContainer>

        <Button type="submit">Create</Button>
      </PaddedSidebarContainer>
    </form>
  );
}
