import type { InternationalString, Reference } from "@iiif/presentation-3";
import { ActionButton } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext, CreatorResource } from "@manifest-editor/creator-api";
import { LanguageFieldEditor } from "@manifest-editor/editors";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { type FormEvent, useState } from "react";

export interface CreateRangeWithItemsPayload {
  type: "Range";
  label?: InternationalString | string;
  items?: Array<Reference<"Canvas"> | Reference<"Range">>;
}

export async function createRangeWithItems(
  data: CreateRangeWithItemsPayload,
  ctx: CreatorFunctionContext,
  parentId?: string,
): Promise<CreatorResource> {
  const rangeId = ctx.generateId(`range`, parentId ? { id: parentId, type: "Range" } : undefined);

  console.log(data.items);

  return ctx.embed({
    id: rangeId,
    type: "Range",
    label: data.label || { en: ["Untitled range"] },
    items: data.items || [],
  });
}

export function RangeWithItemsCreatorForm(props: CreatorContext<CreateRangeWithItemsPayload>) {
  const [label, setLabel] = useState<InternationalString>({ en: [""] });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const formData = Object.fromEntries(data.entries()) as any;

    if (formData.url) {
      props.runCreate({ type: "Range", label });
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
