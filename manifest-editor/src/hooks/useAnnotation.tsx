import { AnnotationNormalized } from "@iiif/presentation-3";
import { useVaultSelector } from "react-iiif-vault";

export function useAnnotation<T = AnnotationNormalized>(options: { id: string }): AnnotationNormalized | T | undefined {
  return useVaultSelector((state) => state.iiif.entities.Annotation[options.id]);
}
