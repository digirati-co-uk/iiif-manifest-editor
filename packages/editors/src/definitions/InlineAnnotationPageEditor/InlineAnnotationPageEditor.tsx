import { isSpecificResource, toRef } from "@iiif/parser";
import type { Reference } from "@iiif/presentation-3";
import { useCreator, useEditor, useGenericEditor, useInlineCreator } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { AnnotationContext, CanvasContext, useAnnotationPage, useVaultSelector } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { AnnotationList } from "../../components/AnnotationList/AnnotationList";
import { AnnotationPreview } from "../../components/AnnotationPreview/AnnotationPreview";
import { InputLabel } from "../../components/Input";
import { createAppActions, emptyCallback } from "../../helpers/create-app-actions";

export function InlineAnnotationPageEditor() {
  const editor = useEditor();
  const canvasId = editor.getPartOf();

  invariant(canvasId, "Canvas id not found.");

  const canvasEditor = useGenericEditor({ id: canvasId, type: "Canvas" });
  const page = canvasEditor.structural.items.get();
  const annoPage = useAnnotationPage({ id: page[0]!.id });
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
      <InputLabel>Annotations</InputLabel>
      <AnnotationList
        id={items.focusId()}
        list={items.get() || []}
        inlineHandle={false}
        reorder={(t) => items.reorder(t.startIndex, t.endIndex)}
        onSelect={(item, idx) => annotationActions.edit(item, idx)}
        createActions={createAppActions(items, emptyCallback)}
      />
      <br />
      {canCreateAnnotation ? (
        <Button
          onClick={() => {
            // @ts-ignore
            document.querySelector('button[data-control="create"]')?.click();
          }}
        >
          Create annotation
        </Button>
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

export function PromptToAddPaintingAnnotations({
  painting,
  page,
  canvasId,
}: {
  painting: Reference;
  page: Reference;
  canvasId?: string;
}) {
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
      <FlexContainer style={{ alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {validToAdd.map((item) => {
            return (
              <CanvasContext canvas={canvasId as string} key={canvasId}>
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
              </CanvasContext>
            );
          })}
        </div>
      </FlexContainer>
    </div>
  );
}
