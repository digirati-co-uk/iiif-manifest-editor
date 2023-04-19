import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { CreatorContext, CreatorFunctionContext } from "@/creator-api/types";
import { InputContainer, InputLabel } from "@/editors/Input";
import { useState } from "react";
import { InternationalString } from "@iiif/presentation-3";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";

export interface CreateHTMLAnnotationPayload {
  body: InternationalString;
  motivation?: string;
}

export async function createHtmlAnnotation(data: CreateHTMLAnnotationPayload, ctx: CreatorFunctionContext) {
  const annotation = {
    id: ctx.generateId("annotation"),
    type: "Annotation",
  };

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
          { parent: { resource: annotation, property: "items" } }
        )
      );
    }
  }

  return ctx.embed({
    ...annotation,
    motivation: data.motivation || "painting",
    body: bodies,
    target: ctx.getParent(),
  });
}

export function CreateHTMLAnnotation(props: CreatorContext<CreateHTMLAnnotationPayload>) {
  const [body, setBody] = useState<InternationalString>({ en: [""] });

  const onSubmit = () => {
    props.runCreate({
      body,
    });
  };

  return (
    <PaddedSidebarContainer>
      <InputContainer>
        <InputLabel>HTML Body</InputLabel>
        <LanguageFieldEditor
          focusId={"html-content"}
          label={"HTML Content"}
          fields={body}
          onSave={(e: any) => setBody(e.toInternationalString())}
        />
      </InputContainer>

      <Button onClick={() => onSubmit()}>Create</Button>
    </PaddedSidebarContainer>
  );
}
