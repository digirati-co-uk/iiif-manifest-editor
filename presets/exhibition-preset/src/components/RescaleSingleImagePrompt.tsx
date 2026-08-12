import { targetWholeCanvas } from "@manifest-editor/editors";
import { useGenericEditor } from "@manifest-editor/shell";
import { Button } from "react-aria-components";
import { useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import { getSingleImageAnnotationToRescale } from "./single-image-rescale";

export function RescaleSingleImagePrompt() {
  const canvas = useCanvas();
  const vault = useVault();
  const annotation = useVaultSelector(
    (_, currentVault) =>
      getSingleImageAnnotationToRescale(currentVault, canvas),
    [canvas?.id, canvas?.items],
  );
  const annotationEditor = useGenericEditor(
    annotation ? { id: annotation.id, type: "Annotation" } : undefined,
    { allowNull: true },
  );

  if (!canvas || !annotation || !annotationEditor?.annotation) return null;

  return (
    <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="mb-3">
        This slide has one image positioned for a multi-image layout. Rescale
        the slide to fit it.
      </p>
      <Button
        className="rounded-md bg-amber-900 px-3 py-2 font-semibold text-white hover:bg-amber-800"
        onPress={() =>
          targetWholeCanvas(vault, canvas, annotationEditor.annotation)
        }
      >
        Rescale for current image
      </Button>
    </div>
  );
}
