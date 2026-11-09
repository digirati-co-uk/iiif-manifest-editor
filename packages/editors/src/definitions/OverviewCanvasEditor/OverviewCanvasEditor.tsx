import { useTranslations } from "@manifest-editor/i18n";
import { CanvasCaptions } from "../../components/CanvasCaptions/CanvasCaptions";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditingResource, useEditor } from "@manifest-editor/shell";
import { AnnotationPageContext, CanvasContext } from "react-iiif-vault";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { PaintingAnnotationList } from "../../components/PaintingAnnotationList/PaintingAnnotationList";
import { createAppActions } from "../../helpers/create-app-actions";

export function OverviewCanvasEditor() {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const resource = useEditingResource();
  const { technical, descriptive, structural, notAllowed } = useEditor();
  const { label } = descriptive;
  const { items, annotations } = structural;
  const pages = items.get();
  const page = pages[0];

  const annotationList = annotations.get();

  if (!page) {
    return <div>{t("ui.errorExpectedCanvasToHaveAtLeastOneAnnotationPage")}</div>;
  }

  return (
    <PaddedSidebarContainer>
      <LanguageFieldEditor
        focusId={label.focusId()}
        label={t("fields.label")}
        fields={label.get()}
        onSave={(e: any) => label.set(e.toInternationalString())}
      />
      <CanvasContext canvas={technical.id.get()}>
        <AnnotationPageContext annotationPage={page.id}>
          <PaintingAnnotationList />
        </AnnotationPageContext>

        <CanvasCaptions />

        {annotationList && annotationList.length ? (
          <LinkingPropertyList
            label={t("ui.annotations")}
            property="annotations"
            items={annotations.get()}
            reorder={(ctx) => annotations.reorder(ctx.startIndex, ctx.endIndex)}
            createActions={createAppActions(annotations, undefined, t, commonT)}
            creationType="AnnotationPage"
            emptyLabel={t("ui.noAnnotations")}
            parent={resource?.resource}
          />
        ) : null}
      </CanvasContext>
    </PaddedSidebarContainer>
  );
}
