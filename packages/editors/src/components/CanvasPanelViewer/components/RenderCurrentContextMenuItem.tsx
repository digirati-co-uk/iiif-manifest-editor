import { useContextMenuStore, useStrategy } from "react-iiif-vault";

export function RenderCurrentContextMenuItem() {
  const { isMenuOpen, menuPosition } = useContextMenuStore();
  const { strategy } = useStrategy();

  if (!isMenuOpen) {
    return null;
  }

  if (strategy.type === "images") {
    // Check if we overlap?
    for (const image of strategy.images.toReversed()) {
      const imagePosition = image.target.spatial;
      // Check if we overlap?
      if (
        imagePosition &&
        imagePosition.x < menuPosition.x &&
        imagePosition.x + imagePosition.width > menuPosition.x &&
        imagePosition.y < menuPosition.y &&
        imagePosition.y + imagePosition.height > menuPosition.y
      ) {
        return (
          <world-object
            x={imagePosition.x}
            y={imagePosition.y}
            width={imagePosition.width}
            height={imagePosition.height}
          >
            <box
              relativeStyle
              target={{ x: 0, y: 0, width: imagePosition.width, height: imagePosition.height }}
              style={{ outline: "2px solid #AB5373" }}
            />
          </world-object>
        );
      }
    }
  }

  return null;
}
