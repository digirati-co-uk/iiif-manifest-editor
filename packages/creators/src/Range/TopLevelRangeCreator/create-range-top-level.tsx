import type { InternationalString, Reference } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext, CreatorResource } from "@manifest-editor/creator-api";
import { LanguageFieldEditor } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";

export interface CreateTopLevelRangePayload {
  type: "Range";
  label?: InternationalString | string;
  items?: Array<Reference<"Canvas"> | Reference<"Range">>;
}

export async function createRangeTopLevel(
  data: CreateTopLevelRangePayload,
  ctx: CreatorFunctionContext,
  parentId?: string,
): Promise<CreatorResource> {
  const rangeId = ctx.generateId(`range`, parentId ? { id: parentId, type: "Range" } : undefined);

  return ctx.embed({
    id: rangeId,
    type: "Range",
    label: data.label || { en: ["Table of Contents"] },
    items: (data.items || []).map((item) => ctx.ref(item)),
  });
}

export function TopLevelRangeCreatorForm(props: CreatorContext<CreateTopLevelRangePayload>) {
  const [label, setLabel] = useState<InternationalString>({ en: [""] });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (label) {
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
          Create range
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
