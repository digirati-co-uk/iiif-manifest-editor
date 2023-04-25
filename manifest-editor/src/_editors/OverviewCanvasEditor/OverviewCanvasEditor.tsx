import { useEditingResource, useEditor } from "@/shell/EditingStack/EditingStack";
import React, { useState } from "react";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { AnnotationPageContext, CanvasContext } from "react-iiif-vault";
import { PaintingAnnotationList } from "@/_components/ui/PaintingAnnotationList/PaintingAnnotationList";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { LinkingPropertyList } from "@/_components/ui/LinkingPropertyList/LinkingPropertyList";

export function OverviewCanvasEditor() {
  const resource = useEditingResource();
  const { technical, descriptive, structural, notAllowed } = useEditor();
  const { label } = descriptive;
  const { items, annotations } = structural;
  const pages = items.get();
  const page = pages[0];

  const annotationList = annotations.get();

  return (
    <PaddedSidebarContainer>
      <LanguageFieldEditor
        focusId={label.focusId()}
        label={"Label"}
        fields={label.get()}
        onSave={(e: any) => label.set(e.toInternationalString())}
      />
      <CanvasContext canvas={technical.id.get()}>
        <AnnotationPageContext annotationPage={page.id}>
          <PaintingAnnotationList />
        </AnnotationPageContext>

        {annotationList && annotationList.length ? (
          <LinkingPropertyList
            label="Annotations"
            property="annotations"
            items={annotations.get()}
            reorder={(ctx) => annotations.reorder(ctx.startIndex, ctx.endIndex)}
            createActions={createAppActions(annotations)}
            creationType="AnnotationPage"
            emptyLabel="No annotations"
            parent={resource?.resource}
          />
        ) : null}
      </CanvasContext>
    </PaddedSidebarContainer>
  );
}
