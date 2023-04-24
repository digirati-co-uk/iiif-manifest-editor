import { useEditor, useGenericEditor } from "@/shell/EditingStack/EditingStack";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { AnnotationList } from "@/_components/ui/AnnotationList/AnnotationList";
import { useCreator, useInlineCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { AnnotationContext, useAnnotationPage, useVaultSelector } from "react-iiif-vault";
import { Reference } from "@iiif/presentation-3";
import { isSpecificResource, toRef } from "@iiif/parser";
import { getValue } from "@iiif/vault-helpers";
import { RichMediaLink } from "@/components/organisms/RichMediaLink/RichMediaLink";
import { AnnotationPreview, AnnotationTargetLabel } from "@/_components/ui/AnnotationPreview/AnnotationPreview";
import { FlexContainer } from "@/components/layout/FlexContainer";
import invariant from "tiny-invariant";

export function InlineAnnotationPageEditor() {
  const editor = useEditor();
  const canvasId = editor.getPartOf();

  invariant(canvasId, "Canvas id not found.");

  const canvasEditor = useGenericEditor({ id: canvasId, type: "Canvas" });
  const page = canvasEditor.structural.items.get();
  const annoPage = useAnnotationPage({ id: page[0].id });
  const hasMultiplePainting = (annoPage?.items.length || 0) > 1;

  const { items } = editor.structural;

  const [canCreateAnnotation, annotationActions] = useCreator(
    editor.ref(),
    "items",
    "Annotation",
    canvasId ? { id: canvasId, type: "Canvas" } : undefined
  );

  // Does the canvas have multiple media?

  return (
    <PaddedSidebarContainer>
      <AnnotationList
        id={items.focusId()}
        list={items.get() || []}
        inlineHandle={false}
        reorder={(t) => items.reorder(t.startIndex, t.endIndex)}
        onSelect={(item, idx) => annotationActions.edit(item, idx)}
        createActions={createAppActions(items)}
      />
      {annoPage /*&& hasMultiplePainting*/ ? (
        <PromptToAddPaintingAnnotations painting={annoPage} page={editor.ref()} />
      ) : null}
    </PaddedSidebarContainer>
  );
}

export function useAnnotationTargetAnnotations(id: string, deps: any[]) {
  const annotationPage = useAnnotationPage({ id });
  return useVaultSelector(
    (state, vault) => {
      const toList = [];
      for (const annoRef of annotationPage?.items || []) {
        const anno = vault.get(annoRef);
        const type = (anno?.target || []) as any;
        if (type && isSpecificResource(type) && (type as any).source?.type === "Annotation") {
          toList.push(anno);
        }
      }
      return toList;
    },
    [id, ...deps]
  );
}

function PromptToAddPaintingAnnotations({ painting, page }: { painting: Reference; page: Reference }) {
  const paintingAnnotations = useAnnotationPage({ id: painting.id });
  const pageEditor = useGenericEditor({ id: page.id, type: "AnnotationPage" });
  const totalItems = (pageEditor.structural.items.get() || []).length;
  const targets = useAnnotationTargetAnnotations(page.id, [totalItems]);
  const annotations = useVaultSelector(
    (state, vault) => vault.get(paintingAnnotations?.items || []),
    [targets, totalItems]
  );

  const validToAdd = annotations.filter((item) => {
    const alreadyAdded = targets.find((t) => {
      return toRef(t.target)?.id === item.id;
    });
    return !alreadyAdded;
  });

  const creator = useInlineCreator();

  if (validToAdd.length === 0) {
    return null;
  }

  return (
    <div key={paintingAnnotations?.items.length}>
      <h3>Add describing annotations</h3>
      <FlexContainer style={{ alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {validToAdd.map((item) => {
            return (
              <AnnotationContext annotation={item.id}>
                <AnnotationPreview
                  margin
                  onClick={async () => {
                    await creator.create(
                      "@manifest-editor/no-body-annotation",
                      { motivation: "describing" },
                      {
                        parent: {
                          resource: page,
                          property: "items",
                        },
                        target: {
                          id: item.id,
                          type: "Annotation",
                        },
                      }
                    );
                  }}
                />
              </AnnotationContext>
            );
          })}
        </div>
      </FlexContainer>
    </div>
  );
}
