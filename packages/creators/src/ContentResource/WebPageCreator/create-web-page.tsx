import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";

export interface CreateWebpagePayload {
  url: string;
  label?: InternationalString;
}

export async function createWebPage(data: CreateWebpagePayload, ctx: CreatorFunctionContext) {
  return ctx.embed({
    id: data.url,
    type: "Text",
    label: data.label,
    format: "text/html",
  });
}

export function CreateWebPageForm(props: CreatorContext) {
  const [label, setLabel] = useState<InternationalString>({ en: [""] });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    if (formData.url) {
      props.runCreate({ url: formData.url, label });
    }
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <LanguageFieldEditor
          focusId={"label"}
          label={"Label"}
          fields={label}
          onSave={(e: any) => setLabel(e.toInternationalString())}
        />

        <InputContainer $wide>
          <InputLabel htmlFor="id">Link</InputLabel>
          <Input id="url" name="url" defaultValue="" />
        </InputContainer>

        <ActionButton primary large type="submit">
          Create link
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
