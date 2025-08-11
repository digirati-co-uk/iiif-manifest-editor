import { useInStack } from "@manifest-editor/editors";
import {
  type BackgroundPanel,
  useCreator,
  useCustomContextMenu,
  useEditingResource,
  useLayoutActions,
} from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";

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
      resource: { type: "Canvas" },
      items: [
        {
          id: "edit-canvas",
          label: "Edit Canvas",
          enabled: true,
          onAction: ({ resource }) => edit(resource),
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
