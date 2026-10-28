import type { CatalogOverlay } from "../../../schema.ts";
import type { SourceCatalogs } from "../../../catalog-types.ts";

/**
 * Dutch (nl) plain-wording overlay — creators namespace
 *
 * "Iets toevoegen" (add something) matches the English plain "Add something".
 * "Kies wat je wilt toevoegen" is a natural Dutch plain-language instruction.
 * "Pagina toevoegen" replaces "Canvas aanmaken" for plain wording.
 */
export const catalog = {
  resource: {
    create: "Iets toevoegen",
    chooseType: "Kies wat je wilt toevoegen",
  },
  canvas: {
    create: "Pagina toevoegen",
  },
} as const satisfies CatalogOverlay<SourceCatalogs["creators"]>;
