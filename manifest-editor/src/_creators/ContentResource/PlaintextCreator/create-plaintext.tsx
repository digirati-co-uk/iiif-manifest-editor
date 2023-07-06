import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { CreatorContext, CreatorFunctionContext } from "@/creator-api/types";
import { InputContainer, InputLabel, Input } from "@/editors/Input";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { InternationalString } from "@iiif/presentation-3";
import { FormEvent, useState } from "react";

export interface CreatePlaintextPayload {
  url: string;
  label?: InternationalString;
}

export async function createPlaintext(data: CreatePlaintextPayload, ctx: CreatorFunctionContext) {
  return ctx.embed({
    id: data.url,
    type: "Text",
    label: data.label,
    format: "text/plain",
  });
}

export function CreatePlaintextForm(props: CreatorContext) {
  const [label, setLabel] = useState<InternationalString>({ en: ["View as text"] });

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

        <InputContainer wide>
          <InputLabel htmlFor="id">Link to plaintext</InputLabel>
          <Input id="url" name="url" defaultValue="" />
        </InputContainer>

        <Button type="submit">Create</Button>
      </form>
    </PaddedSidebarContainer>
  );
}
