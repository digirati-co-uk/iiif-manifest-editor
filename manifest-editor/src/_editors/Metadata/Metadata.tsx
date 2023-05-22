import { ReorderList } from "@/_components/ui/ReorderList/ReorderList.dndkit";
import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { FlexContainer } from "@/components/layout/FlexContainer";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";

import { useEditor } from "@/shell/EditingStack/EditingStack";
import { getValue } from "@iiif/vault-helpers/i18n";
import { useState } from "react";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { EmptyState } from "@/madoc/components/EmptyState";

export function Metadata() {
  const { descriptive } = useEditor();
  const [ordering, setOrdering] = useState(false);
  const items = descriptive.metadata.getSortable();

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
      {(items || []).length !== 0 ? (
        <FlexContainer style={{ position: "sticky", top: 0, display: "block" }}>
          <Button style={{ marginLeft: "auto" }} onClick={() => setOrdering((e) => !e)}>
            {ordering ? "Disable ordering" : "Enable ordering"}
          </Button>
        </FlexContainer>
      ) : null}
      {ordering ? (
        <ReorderList
          reorder={(e) => descriptive.metadata.reorder(e.startIndex, e.endIndex)}
          id={descriptive.metadata.focusId()}
          inlineHandle={false}
          items={items}
          renderItem={renderItem}
          createActions={createAppActions(descriptive.metadata)}
        />
      ) : (
        (items || []).map(renderItem)
      )}

      {(items || []).length === 0 && (
        <EmptyState $noMargin $box>
          No metadata items
        </EmptyState>
      )}

      <Button
        style={{ position: "sticky", bottom: 0 }}
        onClick={() => descriptive.metadata.add({ en: [""] }, { en: [""] })}
      >
        Add metadata item
      </Button>
    </PaddedSidebarContainer>
  );
}
