import { ReorderList } from "@/_components/ui/ReorderList/ReorderList.dndkit";
import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { hash } from "@/helpers/hash";
import { useEditor } from "@/shell/EditingStack/EditingStack";
import { MetadataItem } from "@iiif/presentation-3";
import { getValue } from "@iiif/vault-helpers/i18n";
import { useMemo } from "react";

export function Metadata() {
  const { descriptive } = useEditor();
  const metadata = descriptive.metadata.get();
  const items: Array<MetadataItem & { id: string; type: string }> = useMemo(() => {
    return (metadata || []).map((i) => ({
      id: hash(i),
      type: "MetadataItem",
      ...i,
    }));
  }, [metadata]);

  return (
    <PaddedSidebarContainer>
      <ReorderList
        reorder={(e) => descriptive.metadata.reorder(e.startIndex, e.endIndex)}
        id={descriptive.metadata.focusId()}
        inlineHandle={false}
        items={items}
        renderItem={(e: any, idx, e2: any) => (
          <>
            <h4>{getValue(e.label)}</h4>
            <LanguageFieldEditor
              focusId={e.id}
              label={"Label"}
              fields={e.label || { none: [] }}
              onSave={(label: any) => descriptive.metadata.update(idx, label.toInternationalString(), e.value)}
            />
            <LanguageFieldEditor
              focusId={e.id + "_value"}
              label={"Value"}
              fields={e.value || { none: [] }}
              onSave={(value: any) => descriptive.metadata.update(idx, e.label, value.toInternationalString())}
            />
          </>
        )}
      />

      <Button onClick={() => descriptive.metadata.add({ en: [""] }, { en: [""] })}>Add metadata item</Button>
    </PaddedSidebarContainer>
  );
}
