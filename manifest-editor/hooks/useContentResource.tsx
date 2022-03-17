import { ContentResource } from "@iiif/presentation-3";
import { useVaultSelector } from "react-iiif-vault";

export function useContentResource<T = ContentResource>(
  options: {
    id?: string;
  } = {}
): ContentResource | T | undefined {
  return useVaultSelector(
    (state) => state.iiif.entities.ContentResource[options.id || ""]
  );
}
