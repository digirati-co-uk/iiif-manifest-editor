import { toRef } from "@iiif/parser";
import { propertyLabels } from "@manifest-editor/editor-api";
import { useTranslations } from "@manifest-editor/i18n";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useCreator, useEditingResource, useEditor } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { InputContainer, InputLabel } from "@manifest-editor/ui/editors/Input";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { RangeList } from "../../components/RangeList";
import { useDisplayLabel } from "../../i18n";
import { RequiredStatementField } from "../DescriptiveProperties/DescriptiveProperties";

/**
 * Overview tab for ranges: the descriptive fields that matter most for a range
 * (label, summary and required statement) followed by its sub-ranges.
 */
export function RangeOverview() {
  const t = useTranslations("editors");
  const apiLabel = useDisplayLabel();
  const resource = useEditingResource();
  const { descriptive, structural, notAllowed } = useEditor();
  const { label, summary } = descriptive;
  const [canCreateRange, rangeActions] = useCreator(resource?.resource, "items", "Range");
  const subRanges = (structural.items.get() || []).filter((item) => toRef(item)?.type === "Range");

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("label") ? (
        <LanguageFieldEditor
          containerId={label.containerId()}
          focusId={label.focusId()}
          label={apiLabel(propertyLabels.label)!}
          fields={label.get()}
          onSave={(e: any, _index, _property, scoped) => label.withVault(scoped!).set(e.toInternationalString())}
        />
      ) : null}
      {!notAllowed.includes("summary") ? (
        <LanguageFieldEditor
          containerId={summary.containerId()}
          focusId={summary.focusId()}
          label={apiLabel(propertyLabels.summary)!}
          disallowHTML={false}
          fields={summary.get()}
          onSave={(e: any, _index, _property, scoped) => summary.withVault(scoped!).set(e.toInternationalString())}
        />
      ) : null}
      {!notAllowed.includes("requiredStatement") ? <RequiredStatementField /> : null}

      {!notAllowed.includes("items") ? (
        <>
          <InputContainer $wide>
            <InputLabel>{t("ui.ranges")}</InputLabel>
            {subRanges.length ? (
              <RangeList
                id={structural.items.focusId()}
                list={subRanges as any}
                inlineHandle={false}
                onSelect={(item) => rangeActions.edit(item)}
              />
            ) : (
              <EmptyState $noMargin $box>
                {t("ui.noRanges")}
              </EmptyState>
            )}
          </InputContainer>
          {canCreateRange ? <Button onClick={() => rangeActions.create()}>{t("ui.addRange")}</Button> : null}
        </>
      ) : null}
    </PaddedSidebarContainer>
  );
}
