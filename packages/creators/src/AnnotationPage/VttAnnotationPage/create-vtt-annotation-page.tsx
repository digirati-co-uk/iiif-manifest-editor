import { getValue } from "@iiif/helpers";
import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";
import { isHttpUrl } from "../../resource-probes";

export interface CreateVttAnnotationPagePayload {
  url: string;
  label?: InternationalString;
  language?: string;
}

export async function createVttAnnotationPage(data: CreateVttAnnotationPagePayload, ctx: CreatorFunctionContext) {
  const url = data.url.trim();
  if (!isHttpUrl(url)) throw new Error("Enter an absolute HTTP or HTTPS URL for the WebVTT file.");
  const canvas = ctx.getParent();
  if (canvas?.type !== "Canvas") throw new Error("WebVTT captions must belong to a Canvas.");

  const body = ctx.embed({
    id: url,
    type: "Text",
    format: "text/vtt",
    ...(getValue(data.label) ? { label: data.label } : {}),
    ...(data.language?.trim() ? { language: data.language.trim() } : {}),
  });
  const annotation = ctx.embed({
    id: ctx.generateId("annotation"),
    type: "Annotation",
    motivation: "supplementing",
    body,
    target: canvas,
  });
  return ctx.embed({
    id: ctx.generateId("annotation-page"),
    type: "AnnotationPage",
    items: [annotation],
  });
}

export function CreateVttAnnotationPageForm(props: CreatorContext<CreateVttAnnotationPagePayload>) {
  const [label, setLabel] = useState<InternationalString>(
    props.options.initialData?.label || { en: ["Captions in WebVTT format"] }
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const url = String(data.get("url") || "").trim();
    const language = String(data.get("language") || "").trim();

    props.runCreate({
      url,
      label: getValue(label) ? label : undefined,
      language: language || undefined,
    });
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <p id="vtt-help" className="mb-4 text-sm text-gray-600">
          Link an existing WebVTT (.vtt) file to this canvas. Host the file at a public URL before adding it.
        </p>

        <InputContainer $wide>
          <InputLabel htmlFor="vtt-url">WebVTT file URL</InputLabel>
          <Input
            id="vtt-url"
            name="url"
            type="url"
            required
            placeholder="https://example.org/captions.vtt"
            pattern="https?://.+"
            title="Enter an absolute http:// or https:// URL"
            aria-describedby="vtt-help"
            defaultValue={props.options.initialData?.url || ""}
          />
        </InputContainer>

        <LanguageFieldEditor
          focusId="vtt-label"
          label="Label"
          fields={label}
          onSave={(e: any) => setLabel(e.toInternationalString())}
        />

        <InputContainer $wide>
          <InputLabel htmlFor="vtt-language">Language (BCP 47 code)</InputLabel>
          <Input
            id="vtt-language"
            name="language"
            type="text"
            placeholder="en"
            title="A language code such as en, fr or pt-BR"
            defaultValue={props.options.initialData?.language ?? "en"}
          />
        </InputContainer>

        <ActionButton primary large type="submit">
          Add captions
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
