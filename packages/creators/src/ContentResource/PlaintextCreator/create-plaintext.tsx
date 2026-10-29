import { useTranslations } from "@manifest-editor/i18n";
import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";

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
  const property = useTranslations("editor-api");
  const t = useTranslations("creators");
  const common = useTranslations("common");
  const [label, setLabel] = useState<InternationalString>(
    props.options.initialData?.label || {
      en: ["View as text"],
    }
  );

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
          label={property("fields.label")}
          fields={label}
          onSave={(e: any) => setLabel(e.toInternationalString())}
        />

        <InputContainer $wide>
          <InputLabel htmlFor="url">{t("form.textUrl")}</InputLabel>
          <Input type="url" id="url" name="url" defaultValue={props.options.initialData?.url || ""} />
        </InputContainer>

        <ActionButton primary large type="submit">
          {common("actions.create")}
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
