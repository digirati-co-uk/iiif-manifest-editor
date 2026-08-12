import { type SvgSelector, useCanvas } from "react-iiif-vault/presentation-4";

export function AtlasRenderSVGSelector({
  id,
  target,
  style,
  onClick,
}: {
  id: string;
  target: SvgSelector;
  style?: any;
  onClick?: () => void;
}) {
  const canvas = useCanvas();
  if (!canvas) return null;
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events -- Existing interaction behavior.
    <shape
      id={id}
      points={target.points || []}
      target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}
      relativeStyle={true}
      relativeSize={false}
      style={
        style || {
          border: "2px solid rgba(255, 255, 255, 0.2)",
          ":hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }
      }
      // @ts-expect-error
      onClick={onClick}
    />
  );
}
