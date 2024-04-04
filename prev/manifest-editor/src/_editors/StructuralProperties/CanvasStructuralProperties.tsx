import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { useEditingResource, useEditor } from "@/shell/EditingStack/EditingStack";
import { AnnotationPageContext, CanvasContext } from "react-iiif-vault";
import { createAppActions } from "../LinkingProperties/LinkingProperties.helpers";
import { LinkingPropertyList } from "@/_components/ui/LinkingPropertyList/LinkingPropertyList";
import React from "react";
import { PaintingAnnotationList } from "@/_components/ui/PaintingAnnotationList/PaintingAnnotationList";

export function CanvasStructuralProperties() {
  const resource = useEditingResource();
  const { technical, structural } = useEditor();
  const { items, annotations } = structural;
  const pages = items.get();

  if (pages.length > 1) {
    return <div>Unsupported canvas (multiple annotation pages)</div>;
  }

  const page = pages[0];

  // For now - we unwrap the annotation page.
  return (
    <PaddedSidebarContainer>
      <CanvasContext canvas={technical.id.get()}>
        <AnnotationPageContext annotationPage={page.id}>
          <PaintingAnnotationList />
        </AnnotationPageContext>

        <LinkingPropertyList
          containerId={annotations.containerId()}
          label="Annotations"
          property="annotations"
          items={annotations.get()}
          reorder={(ctx) => annotations.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(annotations)}
          creationType="AnnotationPage"
          emptyLabel="No annotations"
          parent={resource?.resource}
        />
      </CanvasContext>
    </PaddedSidebarContainer>
  );
}
