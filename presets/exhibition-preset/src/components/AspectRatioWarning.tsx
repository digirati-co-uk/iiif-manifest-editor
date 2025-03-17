import { useCanvas } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { getHeightWidthRatio } from "../helpers";

export function AspectRatioWarning() {
  const canvas = useCanvas();
  invariant(canvas);

  const ratio =
    canvas.width && canvas.height ? canvas.width / canvas.height : 0;
  const target = getHeightWidthRatio(canvas.behavior || []);

  if (Math.abs(ratio - target.ratio) < 0.01) return null;

  return (
    <div className="p-2 rounded bg-me-100">
      <div className="text-me-700-500">Aspect ratio warning</div>
      <div className="text-sm text-black/60">
        The aspect ratio of this canvas is {ratio.toFixed(2)} but the target
        aspect ratio is {target.ratio.toFixed(2)}. Some parts of this image may
        be cropped.
        <div className="relative h-32 w-full mt-2">
          <div
            className="bg-[red] left-0 top-0 z-2 opacity-50 max-w-32 max-h-32"
            style={{ aspectRatio: ratio.toFixed(2) }}
          >
            <div
              className="asbolute bg-[white] left-0 top-0 z-1 opacity-50 max-w-32 max-h-32"
              style={{ aspectRatio: target.ratio }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
