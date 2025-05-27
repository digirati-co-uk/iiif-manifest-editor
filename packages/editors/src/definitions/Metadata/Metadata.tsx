import { MetadataContainer } from "@manifest-editor/components";
import { EmptyState } from "@manifest-editor/components";
import { useEditor } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { Fragment, useState } from "react";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { ReorderList } from "../../components/ReorderList/ReorderList.dndkit";
import { createAppActions } from "../../helpers/create-app-actions";

export function Metadata() {
  const { descriptive } = useEditor();
  const [ordering, setOrdering] = useState(false);
  const items = descriptive.metadata.getSortable();

  const renderItem = (e: any, idx: number) => (
    <MetadataContainer key={idx} label={e.label} aria-label={`Metadata item ${idx}`}>
      <LanguageFieldEditor
        focusId={e.id}
        label={"Label"}
        fields={e.label || { none: [] }}
        onSave={(label: any) => descriptive.metadata.update(idx, label.toInternationalString(), e.value)}
        disallowHTML
      />
      <LanguageFieldEditor
        focusId={e.id + "_value"}
        label={"Value"}
        fields={e.value || { none: [] }}
        onSave={(value: any) => descriptive.metadata.update(idx, e.label, value.toInternationalString())}
        disallowHTML
      />
    </MetadataContainer>
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
