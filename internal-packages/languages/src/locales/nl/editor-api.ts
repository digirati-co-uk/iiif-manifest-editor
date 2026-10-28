/**
 * Dutch (nl) — editor-api namespace
 *
 * IIIF resource type names are translated where they appear as human-readable
 * labels; the underlying IIIF @type values and identifiers remain untranslated.
 *
 * Layout names are descriptive translations of the English labels.
 * "Leeg canvas" (blank canvas) keeps "canvas" as the IIIF term.
 */
export const catalog = {
  resources: {
    manifest: "Manifest",
    canvas: "Canvas",
    range: "Range",
    collection: "Collectie",
    annotation: "Annotatie",
    annotationPage: "Annotatiepagina",
    contentResource: "Inhoudsresource",
  },
  layout: {
    pair: "Naast elkaar",
    triptych: "Drie kolommen",
    featureLeft: "Links uitgelicht",
    blank: "Leeg canvas",
  },
  fields: {
    label: "Label",
    summary: "Samenvatting",
    width: "Breedte",
    height: "Hoogte",
    duration: "Duur",
  },
} as const;
