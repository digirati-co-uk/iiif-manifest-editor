import {
  type ContextMenuItem,
  useCreator,
  useEditingResource,
  useEditingStack,
  useLayoutActions,
  useResourceContextMenuItems,
} from "@manifest-editor/shell";
import { useMemo } from "react";
import { Header, Menu, MenuItem, MenuSection } from "react-aria-components";
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
        return (
          <PaintingAnnotationContextMenu
            key={image.id}
            canvasId={canvasId}
            position={position}
            annotationId={image.annotationId}
            close={close}
          />
        );
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
            sectionTitle: "Canvas",
            items: [
              {
                id: "edit",
                label: "Edit canvas",
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
  canvasId,
  position,
  annotationId,
  close,
}: {
  canvasId?: string;
  position: { x: number; y: number };
  annotationId: string;
  close: () => void;
}) {
  const { edit } = useLayoutActions();
  const canvasItems = useResourceContextMenuItems({
    id: canvasId,
    type: "Canvas",
  });
  const items = useResourceContextMenuItems({
    id: annotationId,
    type: "Annotation",
  });

  const menuItems = useMemo(() => {
    if (items.length === 0) {
      return [
        {
          sectionTitle: "Painting Annotation",
          items: [
            {
              id: "edit",
              label: "Edit",
              onAction: () => edit({ id: annotationId, type: "Annotation" }),
            },
          ],
        },
        ...canvasItems,
      ];
    }
    return [...items, ...canvasItems];
  }, [canvasItems, items, annotationId, edit]);

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
  menuItems: Array<{ sectionTitle?: string; items: ContextMenuItem[] }>;
  close: () => void;
}) {
  return (
    <Menu className="bg-white rounded shadow-xl min-w-32 border border-gray-200">
      {menuItems.map((section, key) => {
        const sectionItems = section.items?.filter((item, keyInner) => {
          if (item.enabled === false) {
            return false;
          }
          if (item.enabledFunction) {
            return item.enabledFunction({ resource });
          }
          return true;
        });
        if (sectionItems.length === 0) {
          return null;
        }

        return (
          <MenuSection key={keyInner}>
            {section.sectionTitle ? (
              <Header className="bg-gray-200 text-gray-500 text-xs px-2 py-1">{section.sectionTitle}</Header>
            ) : null}
            {sectionItems.map((item, key2) => {
              return (
                <MenuItem
                  className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5"
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
        );
      })}
    </Menu>
  );
}
