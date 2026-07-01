import { importEntities } from "@iiif/helpers/vault/actions";
import type { InternationalString, Reference } from "@iiif/presentation-3";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditingResource } from "@manifest-editor/shell";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";

export function PartOfReferenceEditor() {
  const editing = useEditingResource();
  const vault = useVault();
  const current = useVaultSelector((state) => {
    const parent = editing?.parent;
    const property = editing?.property;
    const index = editing?.index;
    const fallback = editing?.resource.source as any;
    if (!parent || property !== "partOf" || typeof index === "undefined") {
      return fallback;
    }
    const item = (state.iiif.entities as any)[parent.type]?.[parent.id]?.partOf?.[index];
    return { ...fallback, ...item, label: item?.label || fallback?.label, summary: item?.summary || fallback?.summary };
  }) as any;
  const ref = (current?.type === "SpecificResource" ? current.source : current) as
    | (Reference & { label?: InternationalString; summary?: InternationalString })
    | undefined;

  function update(patch: { label?: InternationalString; summary?: InternationalString }) {
    if (!editing?.parent || editing.property !== "partOf" || typeof editing.index === "undefined" || !ref) {
      return;
    }

    const parent = vault.get(editing.parent as any);
    const next = [...((parent as any)?.partOf || [])];
    const type = (ref as any).originalType || ref.type;
    next[editing.index] = { ...ref, ...patch, type };
    delete (next[editing.index] as any).originalType;
    vault.modifyEntityField(editing.parent as any, "partOf", next);
    if (ref.id && type && (patch.label || patch.summary)) {
      vault.dispatch(
        importEntities({
          entities: {
            [type]: {
              [ref.id]: {
                id: ref.id,
                type,
                ...(patch.label ? { label: patch.label } : {}),
                ...(patch.summary ? { summary: patch.summary } : {}),
              },
            },
          },
        } as any),
      );
    }
  }

  return (
    <PaddedSidebarContainer>
      <LanguageFieldEditor
        label="Label"
        fields={(ref?.label || { none: [] }) as InternationalString}
        onSave={(value: any) => update({ label: value.toInternationalString() })}
      />
      <LanguageFieldEditor
        label="Summary"
        fields={(ref?.summary || { none: [] }) as InternationalString}
        onSave={(value: any) => update({ summary: value.toInternationalString() })}
      />
      <InputContainer $wide>
        <InputLabel htmlFor="part-of-reference-id">Identifier</InputLabel>
        <Input id="part-of-reference-id" disabled value={ref?.id || ""} />
      </InputContainer>
    </PaddedSidebarContainer>
  );
}
