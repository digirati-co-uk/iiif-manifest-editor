import { useTranslations } from "@manifest-editor/i18n";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useCreator, useEditingResource, useEditor } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { CanvasList } from "../../components/CanvasList/CanvasList";
import { InputContainer, InputLabel, InputLabelEdit } from "../../components/Input";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { useToggleList } from "../../helpers";
import { createAppActions } from "../../helpers/create-app-actions";

export function ManifestStructuralProperties() {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const resource = useEditingResource();
  const { structural, notAllowed } = useEditor();
  const [toggled, toggle] = useToggleList();

  const { items, structures } = structural;

  const [canCreateCanvas, canvasActions] = useCreator(resource?.resource, "items", "Canvas", undefined, {
    isPainting: true,
  });

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("items") ? (
        <>
          <InputContainer $wide>
            {!items.get()?.length ? (
              <>
                <InputLabel>{t("ui.canvases")}</InputLabel>
                <EmptyState $noMargin $box>
                  {t("ui.noCanvases")}
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                {t("ui.canvases")}
                <InputLabelEdit data-active={toggled.items} onClick={() => toggle("items")} />
              </InputLabel>
            )}
            <CanvasList
              id={items.focusId()}
              list={items.getSortable() || []}
              inlineHandle={false}
              reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
              onSelect={(item, idx) => canvasActions.edit(item, idx)}
              createActions={createAppActions(items, undefined, t, commonT)}
            />
          </InputContainer>
          {canCreateCanvas ? <Button onClick={() => canvasActions.create()}>{t("canvas.add")}</Button> : null}
        </>
      ) : null}

      {!notAllowed.includes("structures") ? (
        <LinkingPropertyList
          label={t("ui.ranges")}
          property="structures"
          items={structures.getSortable()}
          reorder={(ctx) => structures.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(structures, undefined, t, commonT)}
          creationType="Range"
          emptyLabel={t("ui.noRanges")}
          parent={resource?.resource}
        />
      ) : null}
    </PaddedSidebarContainer>
  );
}
