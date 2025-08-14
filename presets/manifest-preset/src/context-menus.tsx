import { EditorInstance } from "@manifest-editor/editor-api";
import { useInStack } from "@manifest-editor/editors";
import {
  type BackgroundPanel,
  useCreator,
  useCustomContextMenu,
  useEditingResource,
  useLayoutActions,
} from "@manifest-editor/shell";
import { useMemo } from "react";
import { useCanvas, useVault, useVaultSelector } from "react-iiif-vault";

export const contextMenus: BackgroundPanel = {
  id: "manifest-context-menus",
  label: "Context menus",
  render: () => <ContextMenus />,
};

function ContextMenus() {
  return <CanvasContextMenu />;
}

function CanvasContextMenu() {
  const canvasResource = useInStack("Canvas");
  const canvasRef = canvasResource?.resource.source;

  const current = useEditingResource();
  const currentId = current?.resource?.source?.id;

  const canvas = useCanvas(canvasRef ? canvasRef : undefined);
  const { edit } = useLayoutActions();
  const annotationPage = canvas?.items?.[0]?.id;

  const [canCreateAnnotation, annotationActions] = useCreator(
    { id: annotationPage, type: "AnnotationPage" },
    "items",
    "Annotation",
    canvasRef,
    {
      isPainting: true,
    },
  );

  useCustomContextMenu(
    {
      sectionTitle: "Canvas",
      resource: { type: "Canvas" },
      items: [
        {
          id: "edit-canvas",
          label: "Edit metadata",
          enabled: true,
          onAction: () => edit({ id: canvasResource?.resource?.source?.id, type: "Canvas" }),
        },
        {
          id: "add-media",
          label: "Add media...",
          enabled: true,
          onAction: ({ resource }) => {
            if (currentId !== resource.id) {
              edit(resource);
            }
            annotationActions.create();
          },
        },
        {
          id: "add-browser",
          label: "Add from IIIF Browser",
          enabled: true,
          onAction: ({ resource }) => {
            if (currentId !== resource.id) {
              edit(resource);
            }
            annotationActions.creator("@manifest-editor/iiif-browser-creator");
          },
        },
      ],
    },
    [canvasRef, currentId, canCreateAnnotation],
  );

  return null;
}

/**
 * This is currently not used, needs work.
 */
function PaintingAnnotationContextMenu() {
  const canvasResource = useInStack("Canvas");
  const canvasRef = canvasResource?.resource.source;

  const current = useEditingResource();
  const currentId = current?.resource?.source?.id;

  const canvas = useCanvas(canvasRef ? canvasRef : undefined);
  const { edit } = useLayoutActions();
  const vault = useVault();
  const annotationPage = canvas?.items?.[0]?.id;
  const fullAnnotationPage = useVaultSelector(
    (_, v) => (annotationPage ? v.get(annotationPage) : null),
    [annotationPage],
  );

  const annotationPageEditor = useMemo(() => {
    if (canvas && fullAnnotationPage) {
      return new EditorInstance({ vault, reference: { id: fullAnnotationPage.id, type: "AnnotationPage" } });
    }
    return null;
  }, [fullAnnotationPage, canvas, vault]);

  // Annotation ordering
  useCustomContextMenu(
    {
      sectionTitle: "Painting Annotation",
      resource: { type: "Annotation" },
      items: [
        {
          id: "edit",
          label: "Edit",
          enabledFunction({ resource }) {
            return resource.id !== currentId;
          },
          onAction: ({ resource }) => {
            edit(resource);
          },
        },
        {
          id: "reorder-bring-to-front",
          label: "Bring to front",
          enabled: !!(annotationPageEditor && (fullAnnotationPage?.items.length || 0) > 1),
          onAction: ({ resource }) => {
            if (annotationPageEditor) {
              const index = fullAnnotationPage.items.findIndex((item: any) => item.id === resource.id);
              if (index !== -1 && index !== fullAnnotationPage.items.length - 1) {
                annotationPageEditor?.structural.items.moveToEnd(index);
              }
            }
          },
        },
        {
          id: "reorder-send-to-back",
          label: "Send to back",
          enabled: !!(annotationPageEditor && (fullAnnotationPage?.items.length || 0) > 1),
          onAction: ({ resource }) => {
            if (annotationPageEditor) {
              const index = fullAnnotationPage.items.findIndex((item: any) => item.id === resource.id);
              if (index !== -1 && index !== 0) {
                annotationPageEditor?.structural.items.moveToStart(index);
              }
            }
          },
        },
      ],
    },
    [currentId, annotationPageEditor, fullAnnotationPage],
  );

  return null;
}
