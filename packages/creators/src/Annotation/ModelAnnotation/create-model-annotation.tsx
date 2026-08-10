import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";

export interface CreateModelAnnotationPayload {
  url: string;
  format?: string;
}

export function modelFormat(url: string, format?: string) {
  if (format) return format;
  return url.toLowerCase().split(/[?#]/)[0]?.endsWith(".gltf") ? "model/gltf+json" : "model/gltf-binary";
}

export function createModelAnnotation(data: CreateModelAnnotationPayload, ctx: CreatorFunctionContext) {
  const body = ctx.embed({
    id: data.url,
    type: "Model",
    format: modelFormat(data.url, data.format),
  });

  const targetType = ctx.options.targetType as "Annotation" | "Canvas";

  if (targetType === "Canvas") {
    const sceneId = ctx.generateId("scene");
    const page = ctx.embed({
      id: ctx.generateId("annotation-page", { id: sceneId, type: "Scene" } as any),
      type: "AnnotationPage",
      items: [
        ctx.embed({
          id: ctx.generateId("annotation"),
          type: "Annotation",
          motivation: "painting",
          body,
          target: {
            type: "SpecificResource",
            source: { id: sceneId, type: "Scene" },
          },
        }),
      ],
    });
    page.setPartOf(sceneId);

    const filename = data.url
      .split(/[?#]/)[0]
      ?.split("/")
      .pop()
      ?.replace(/\.(glb|gltf)$/i, "");
    return ctx.embed({
      id: sceneId,
      type: "Scene",
      label: { en: [filename || "Untitled scene"] },
      items: [page],
    });
  }

  if (targetType === "Annotation") {
    return ctx.embed({
      id: ctx.generateId("annotation"),
      type: "Annotation",
      motivation: "painting",
      body,
      target: ctx.getTarget(),
    });
  }

  throw new Error("Unsupported target type");
}

export function ModelAnnotationCreatorForm(props: CreatorContext<CreateModelAnnotationPayload>) {
  const initialData = props.options.initialData as Partial<CreateModelAnnotationPayload>;
  const [url, setUrl] = useState(initialData.url || "");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (url) props.runCreate({ url, format: initialData.format });
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <InputContainer $wide>
          <InputLabel htmlFor="model-url">Link to GLB or glTF model</InputLabel>
          <Input
            id="model-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.org/model.glb"
          />
        </InputContainer>
        <ActionButton primary type="submit" isDisabled={!url}>
          Add model
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
