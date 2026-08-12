import type { BoxSelector } from "react-iiif-vault/presentation-4";

export function AtlasRenderBoxSelector({
  id,
  target,
  style,
  onClick,
}: {
  id: string;
  target: BoxSelector;
  style?: any;
  onClick?: () => void;
}) {
  const { x, y, width, height } = target.spatial;
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events -- Existing interaction behavior.
    <box
      id={id}
      relativeStyle={true}
      relativeSize={false}
      target={{ x, y, width, height }}
      style={
        style || {
          border: "2px solid rgba(255, 255, 255, 0.2)",
          ":hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }
      }
      onClick={onClick}
    />
  );
}
