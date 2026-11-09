import { flattenCatalog, freezeCatalog } from "./schema.ts";
import type { Catalog } from "./schema.ts";

const accents: Record<string, string> = {
  a: "á",
  e: "ë",
  i: "ï",
  o: "ö",
  u: "ü",
  A: "Á",
  E: "Ë",
  I: "Ï",
  O: "Ö",
  U: "Ü",
};

/** Preserves interpolation names and rich tags. This is a QA catalog, not a translated language. */
export function createPseudoCatalog(source: Catalog, expansion = 0.3): Catalog {
  if (!Number.isFinite(expansion) || expansion < 0 || expansion > 2)
    throw new RangeError("Expansion must be between 0 and 2");
  flattenCatalog(source);
  function visit(branch: Catalog): Catalog {
    return Object.fromEntries(
      Object.entries(branch).map(([key, value]) => {
        if (typeof value !== "string") return [key, visit(value)];
        if (!value) return [key, value];
        const text = value
          .split(/(\{\{[^}]*\}\}|<\/?[^>]*>)/g)
          .map((part) =>
            /^(?:\{\{|<)/.test(part) ? part : part.replace(/[aeiouAEIOU]/g, (letter) => accents[letter]!)
          )
          .join("");
        const length = value.replace(/\{\{[^}]*\}\}|<\/?[^>]*>/g, "").length;
        return [key, `[${text}${"~".repeat(Math.ceil(length * expansion))}]`];
      })
    );
  }
  return freezeCatalog(visit(source));
}
