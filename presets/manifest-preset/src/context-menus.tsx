import { useEditorI18n } from "@manifest-editor/i18n";
import { manifestMessage } from "./i18n";
import { EditorInstance } from "@manifest-editor/editor-api";
import { useInStack } from "@manifest-editor/editors";
import {
  type BackgroundPanel,
  useCreator,
  useCustomContextMenu,
  useEditingResource,
  useLayoutActions,
} from "@manifest-editor/shell";
import { useMemo, useRef } from "react";
import {
  parseSelector,
  useAtlasStore,
  useCanvas,
  useRequestAnnotation,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";

export const contextMenus: BackgroundPanel = {
  id: "manifest-context-menus",
  label: "Context menus",
  labelMessage: manifestMessage("workflow.contextMenus"),
  render: () => <ContextMenus />,
};

function ContextMenus() {
  return <CanvasContextMenu />;
}

function CanvasContextMenu() {
  const { resolveMessage, locale, profile } = useEditorI18n();
  // The viewer currently reads label directly; retained menus must follow provider replacement too.
  const resolver = useRef(resolveMessage);
  resolver.current = resolveMessage;
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
    }
  );

  useCustomContextMenu(
    {
      sectionTitle: resolveMessage(manifestMessage("workflow.canvas")),
      resource: { type: "Canvas" },
      items: [
        {
          id: "edit-canvas",
          get label() {
            return resolver.current(manifestMessage("workflow.editMetadata"), "Edit metadata");
          },
          labelMessage: manifestMessage("workflow.editMetadata"),
          enabled: true,
          onAction: () =>
            edit({ id: canvasResource?.resource?.source?.id, type: "Canvas" }, undefined, { forceOpen: true }),
        },
        {
          id: "add-media",
          get label() {
            return resolver.current(manifestMessage("workflow.addMedia"), "Add media...");
          },
          labelMessage: manifestMessage("workflow.addMedia"),
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
          get label() {
            return resolver.current(manifestMessage("workflow.addFromIiifBrowser"), "Add from IIIF Browser");
          },
          labelMessage: manifestMessage("workflow.addFromIiifBrowser"),
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
    [canvasRef, currentId, canCreateAnnotation, locale, profile, resolveMessage]
  );

  return null;
}

/**
 * This is currently not used, needs work.
 */
function PaintingAnnotationContextMenu() {
  const { resolveMessage, locale, profile } = useEditorI18n();
  // The viewer currently reads label directly; retained menus must follow provider replacement too.
  const resolver = useRef(resolveMessage);
  resolver.current = resolveMessage;
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
    [annotationPage]
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
      sectionTitle: resolveMessage(manifestMessage("workflow.paintingAnnotation")),
      resource: { type: "Annotation" },
      items: [
        {
          id: "edit",
          get label() {
            return resolver.current(manifestMessage("workflow.edit"), "Edit");
          },
          labelMessage: manifestMessage("workflow.edit"),
          enabledFunction({ resource }) {
            return resource.id !== currentId;
          },
          onAction: ({ resource }) => {
            edit(resource, undefined, { forceOpen: true });
          },
        },
        {
          id: "reorder-bring-to-front",
          get label() {
            return resolver.current(manifestMessage("workflow.bringToFront"), "Bring to front");
          },
          labelMessage: manifestMessage("workflow.bringToFront"),
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
          get label() {
            return resolver.current(manifestMessage("workflow.sendToBack"), "Send to back");
          },
          labelMessage: manifestMessage("workflow.sendToBack"),
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
    [currentId, annotationPageEditor, fullAnnotationPage, locale, profile, resolveMessage]
  );

  return null;
}

/**
 * This is not working yet.
 */
function MediaTargetContextMenu() {
  const { resolveMessage, locale, profile } = useEditorI18n();
  // The viewer currently reads label directly; retained menus must follow provider replacement too.
  const resolver = useRef(resolveMessage);
  resolver.current = resolveMessage;
  // const canvas = useCanvas();
  const vault = useVault();
  const store = useAtlasStore();
  const { edit } = useLayoutActions();
  // const bounds = canvas ? { x: 0, y: 0, width: canvas.width, height: canvas.height } : null;
  const bounds = null;
  const { requestAnnotation, isPending, completeRequest, cancelRequest } = useRequestAnnotation({
    onSuccess: (response) => {
      if (response.boundingBox) {
        // target.setPosition(response.boundingBox);
      }
    },
  });

  useCustomContextMenu(
    {
      sectionTitle: resolveMessage(manifestMessage("workflow.paintingAnnotation")),
      resource: { type: "Annotation" },
      items: [
        {
          id: "edit-painting",
          get label() {
            return resolver.current(manifestMessage("workflow.editMetadata"), "Edit metadata");
          },
          labelMessage: manifestMessage("workflow.editMetadata"),
          enabled: true,
          onAction: ({ resource }) => {
            edit(resource);
          },
        },
        {
          id: "save-changes",
          get label() {
            return resolver.current(manifestMessage("workflow.saveChanges"), "Save changes");
          },
          labelMessage: manifestMessage("workflow.saveChanges"),
          enabled: isPending,
          onAction: () => {
            completeRequest();
          },
        },
        {
          id: "discard-changes",
          get label() {
            return resolver.current(manifestMessage("workflow.discardChanges"), "Discard changes");
          },
          labelMessage: manifestMessage("workflow.discardChanges"),
          enabled: isPending,
          onAction: () => {
            cancelRequest();
          },
        },
        {
          id: "edit-position",
          get label() {
            return resolver.current(manifestMessage("workflow.editPosition"), "Edit position");
          },
          labelMessage: manifestMessage("workflow.editPosition"),
          enabled: !isPending,
          enabledFunction: ({ resource }) => {
            const annotation = vault.get(resource);
            const selector = parseSelector(annotation.target?.selector)?.selector;
            return selector?.type === "BoxSelector";
          },
          onAction: ({ resource }) => {
            const annotation = vault.get(resource);
            const selector = parseSelector(annotation.target?.selector)?.selector;

            if (selector?.type === "BoxSelector") {
              requestAnnotation({ type: "target", bounds, selector: selector.spatial });
            }
          },
        },
        {
          id: "target-whole-canvas",
          get label() {
            return resolver.current(manifestMessage("workflow.targetWholeCanvas"), "Target whole canvas");
          },
          labelMessage: manifestMessage("workflow.targetWholeCanvas"),
          enabledFunction: ({ resource }) => {
            const annotation = vault.get(resource);
            const selector = parseSelector(annotation.target?.selector)?.selector;
            return selector?.type !== "BoxSelector";
          },
          onAction: ({ resource }) => {
            // target.removeSelector()
          },
        },
      ],
    },
    [isPending, locale, profile, resolveMessage]
  );

  return null;
}
