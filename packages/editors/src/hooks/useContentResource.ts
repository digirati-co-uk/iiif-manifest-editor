import type {
  ContentResourceNormalized,
  SpecificResourceNormalized,
} from "@iiif/parser/presentation-4-normalized/types";
import { useVaultSelector } from "react-iiif-vault/presentation-4";

export function useContentResource(
  options: {
    id?: string;
  } = {}
): ContentResourceNormalized | SpecificResourceNormalized | undefined {
  return useVaultSelector(
    (state) => state.iiif.entities.ContentResource[options.id || ""],
  ) as ContentResourceNormalized | SpecificResourceNormalized | undefined;
}
