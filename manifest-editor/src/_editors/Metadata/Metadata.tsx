import { ReorderList } from "@/_components/ui/ReorderList/ReorderList.dndkit";
import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { FlexContainer } from "@/components/layout/FlexContainer";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { hash } from "@/helpers/hash";
import { useEditor } from "@/shell/EditingStack/EditingStack";
import { MetadataItem } from "@iiif/presentation-3";
import { getValue } from "@iiif/vault-helpers/i18n";
import { useMemo, useRef, useState } from "react";

export function Metadata() {
  const { descriptive } = useEditor();
  const [ordering, setOrdering] = useState(false);
  const metadata = descriptive.metadata.get();
  const items: Array<MetadataItem & { id: string; type: string }> = useMemo(() => {
    return (metadata || []).map((i, key) => ({
      id: ordering ? hash(i) : `${key}`,
      type: "MetadataItem",
      ...i,
    }));
  }, [metadata]);

  const renderItem = (e: any, idx: number) => (
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
  );

  return (
    <PaddedSidebarContainer>
      <FlexContainer>
        <Button style={{ marginLeft: "auto" }} onClick={() => setOrdering((e) => !e)}>
          Enable reordering
        </Button>
      </FlexContainer>
      {ordering ? (
        <ReorderList
          reorder={(e) => descriptive.metadata.reorder(e.startIndex, e.endIndex)}
          id={descriptive.metadata.focusId()}
          inlineHandle={false}
          items={items}
          renderItem={renderItem}
        />
      ) : (
        items.map(renderItem)
      )}

      <Button onClick={() => descriptive.metadata.add({ en: [""] }, { en: [""] })}>Add metadata item</Button>
    </PaddedSidebarContainer>
  );
}
