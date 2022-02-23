import { AnnotationPageNormalized } from "@iiif/presentation-3";
import { useVaultSelector } from "react-iiif-vault";

export function useAnnotationPage<T = AnnotationPageNormalized>(
  options: {
    id?: string;
  } = {}
): AnnotationPageNormalized | T | undefined {
  return useVaultSelector(
    state =>
      state.iiif.entities.AnnotationPage[
        "https://iiif.wellcomecollection.org/annotations/v3/b28799495/images"
      ]
  );
}
