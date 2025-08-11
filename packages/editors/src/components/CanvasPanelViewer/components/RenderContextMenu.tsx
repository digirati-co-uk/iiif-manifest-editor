import {
  type ContextMenuItem,
  useCreator,
  useEditingResource,
  useEditingStack,
  useLayoutActions,
  useResourceContextMenuItems,
} from "@manifest-editor/shell";
import { Menu, MenuItem, MenuSection } from "react-aria-components";
import { flushSync } from "react-dom";
import { useCanvas, useStrategy } from "react-iiif-vault";

export function RenderContextMenu({
  position,
  close,
  canvasId,
}: {
  position: { x: number; y: number };
  close: () => void;
  canvasId?: string;
}) {
  const { strategy } = useStrategy();

  if (strategy.type === "images") {
    // Check if we overlap?
    for (const image of strategy.images.toReversed()) {
      const imagePosition = image.target.spatial;
      // Check if we overlap?
      if (
        imagePosition &&
        imagePosition.x < position.x &&
        imagePosition.x + imagePosition.width > position.x &&
        imagePosition.y < position.y &&
        imagePosition.y + imagePosition.height > position.y
      ) {
        return <PaintingAnnotationContextMenu position={position} annotationId={image.annotationId} close={close} />;
      }
    }
  }

  if (!canvasId) return null;

  // If nothing, show canvas options.

  return <CanvasContextMenu canvasId={canvasId} close={close} position={position} />;
}

function CanvasContextMenu({
  canvasId,
  position,
  close,
}: {
  canvasId: string;
  position: { x: number; y: number };
  close: () => void;
}) {
  const { edit } = useLayoutActions();
  const items = useResourceContextMenuItems({
    id: canvasId,
    type: "Canvas",
  });

  const menuItems =
    items.length === 0
      ? [
          {
            items: [
              {
                id: "edit",
                label: "Edit",
                onAction: () => edit({ id: canvasId, type: "Canvas" }),
              },
            ],
          },
        ]
      : items;

  return (
    <GenericContextMenu
      position={position}
      resource={{ id: canvasId, type: "Canvas" }}
      menuItems={menuItems}
      close={close}
    />
  );
}

function PaintingAnnotationContextMenu({
  position,
  annotationId,
  close,
}: {
  position: { x: number; y: number };
  annotationId: string;
  close: () => void;
}) {
  const { edit } = useLayoutActions();
  const items = useResourceContextMenuItems({
    id: annotationId,
    type: "Annotation",
  });

  const menuItems =
    items.length === 0
      ? [
          {
            items: [
              {
                id: "edit",
                label: "Edit",
                onAction: () => edit({ id: annotationId, type: "Annotation" }),
              },
            ],
          },
        ]
      : items;

  return (
    <GenericContextMenu
      position={position}
      resource={{ id: annotationId, type: "Annotation" }}
      menuItems={menuItems}
      close={close}
    />
  );
}

function GenericContextMenu({
  position,
  resource,
  menuItems,
  close,
}: {
  position: { x: number; y: number };
  resource: { id: string; type: string };
  menuItems: Array<{ items: ContextMenuItem[] }>;
  close: () => void;
}) {
  return (
    <Menu className="bg-white rounded p-0.5 shadow-xl min-w-32 border border-gray-200">
      {menuItems.map((item, key) => (
        <MenuSection key={key}>
          {item?.items.map((item, key2) => {
            if (item.enabled === false) {
              return null;
            }
            if (item.enabledFunction && !item.enabledFunction({ resource })) {
              return null;
            }

            return (
              <MenuItem
                className="hover:bg-gray-100 px-2 py-1 text-sm"
                key={key2}
                isDisabled={item.disabled}
                onAction={() => {
                  flushSync(() => {
                    item.onAction({ resource, position });
                    close();
                  });
                }}
              >
                {item.label}
              </MenuItem>
            );
          })}
        </MenuSection>
      ))}
    </Menu>
  );
}
