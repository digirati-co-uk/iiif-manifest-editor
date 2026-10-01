const structuralTypes = new Set(["Manifest", "Canvas", "AnnotationPage", "Annotation"]);

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** Ignore generated structural IDs, while preserving references and external resource IDs. */
export function normalizeCookbookManifest(manifest: Json): Json {
  const ids = new Map<string, string>();
  function collect(value: Json, path: string) {
    if (Array.isArray(value)) {
      value.forEach((child, index) => collect(child, `${path}/${index}`));
    } else if (value && typeof value === "object") {
      if (structuralTypes.has(String(value.type)) && typeof value.id === "string" && !ids.has(value.id)) {
        ids.set(value.id, path);
      }
      Object.entries(value).forEach(([key, child]) => collect(child, `${path}/${key}`));
    }
  }
  collect(manifest, "$manifest");

  function normalize(value: Json, key = ""): Json {
    if (typeof value === "string" && (key === "target" || key === "source")) {
      // Keep selectors/fragments significant, and do not rewrite unknown external references.
      const [id, ...fragment] = value.split("#");
      return (ids.get(id) || id) + (fragment.length ? `#${fragment.join("#")}` : "");
    }
    if (Array.isArray(value)) return value.map((child) => normalize(child, key));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          key === "id" && structuralTypes.has(String(value.type)) && typeof child === "string"
            ? ids.get(child) || child
            : normalize(child, key),
        ])
      );
    }
    return value;
  }
  return normalize(manifest);
}
