import type { InternationalString, Reference } from "@iiif/presentation-3";
import { ActionButton } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { LanguageFieldEditor } from "@manifest-editor/editors";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { type FormEvent, useState } from "react";

export interface CreateTopLevelRangePayload {
  label?: InternationalString | string;
  items?: Array<Reference<"Canvas">>;
}

export async function createRangeTopLevel(data: CreateTopLevelRangePayload, ctx: CreatorFunctionContext) {
  return ctx.embed({
    id: ctx.generateId(`range`),
    type: "Range",
    label: data.label || "Table of Contents",
    items: (data.items || []).map((item) => ctx.ref(item)),
  });
}

export function TopLevelRangeCreatorForm(props: CreatorContext<CreateTopLevelRangePayload>) {
  const [label, setLabel] = useState<InternationalString>({ en: [""] });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    if (formData.url) {
      props.runCreate({ label });
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

        <ActionButton primary type="submit">
          Create link
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
