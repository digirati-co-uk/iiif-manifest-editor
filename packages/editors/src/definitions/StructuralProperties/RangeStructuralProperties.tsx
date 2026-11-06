import { useTranslations } from "@manifest-editor/i18n";
import { toRef } from "@iiif/parser";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useCreator, useEditingResource, useEditor } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { InputContainer, InputLabel, InputLabelEdit } from "@manifest-editor/ui/editors/Input";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { RangeList } from "../../components/RangeList";
import { useToggleList } from "../../helpers";
import { createAppActions } from "../../helpers/create-app-actions";

export function RangeStructuralProperties() {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const resource = useEditingResource();
  const { structural, notAllowed } = useEditor();
  const [toggled, toggle] = useToggleList();

  const { items, structures } = structural;

  const [canCreateRange, rangeActions] = useCreator(resource?.resource, "items", "Range");
  const [canCreateCanvas, canvasActions] = useCreator(resource?.resource, "items", "Canvas", undefined, {
    onlyReference: true,
  });

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("items") ? (
        <>
          <InputContainer $wide>
            {!items.get()?.length ? (
              <>
                <InputLabel>{t("ui.ranges")}</InputLabel>
                <EmptyState $noMargin $box>
                  {t("ui.noRanges")}
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                {t("ui.ranges")}
                <InputLabelEdit data-active={toggled.items} onClick={() => toggle("items")} />
              </InputLabel>
            )}
            <RangeList
              id={items.focusId()}
              list={items.get()}
              inlineHandle={false}
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) =>
                toRef(item)?.type === "Canvas" ? canvasActions.edit(item) : rangeActions.edit(item)
              }
              createActions={createAppActions(items, undefined, t, commonT)}
            />
          </InputContainer>
          {canCreateCanvas ? <Button onClick={() => canvasActions.create()}>{t("canvas.add")}</Button> : null}
          {canCreateRange ? <Button onClick={() => rangeActions.create()}>{t("ui.addRange")}</Button> : null}
        </>
      ) : null}
    </PaddedSidebarContainer>
  );
}
