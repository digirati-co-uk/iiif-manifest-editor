import { useTranslations } from "@manifest-editor/i18n";
import type { InternationalString, Reference } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext, CreatorResource } from "@manifest-editor/creator-api";
import { LanguageFieldEditor } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";

export interface CreateRangeWithItemsPayload {
  type: "Range";
  label?: InternationalString | string;
  items?: Array<Reference<"Canvas"> | Reference<"Range">>;
}

export async function createRangeWithItems(
  data: CreateRangeWithItemsPayload,
  ctx: CreatorFunctionContext,
  parentId?: string
): Promise<CreatorResource> {
  const rangeId = ctx.generateId(`range`, parentId ? { id: parentId, type: "Range" } : undefined);

  return ctx.embed({
    id: rangeId,
    type: "Range",
    label: data.label || { en: ["Untitled range"] },
    items: data.items || [],
  });
}

export function RangeWithItemsCreatorForm(props: CreatorContext<CreateRangeWithItemsPayload>) {
  const property = useTranslations("editor-api");
  const t = useTranslations("creators");
  const [label, setLabel] = useState<InternationalString>(props.options.initialData?.label || { en: [""] });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (label) {
      props.runCreate({ type: "Range", label, items: props.options.initialData?.items || [] });
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

        <ActionButton primary type="submit">
          {t("form.createRange")}
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
