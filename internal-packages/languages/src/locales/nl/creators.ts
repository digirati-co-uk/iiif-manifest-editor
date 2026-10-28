/**
 * Dutch (nl) — creators namespace
 *
 * IIIF terms kept untranslated: "canvas", "manifest", "collection".
 * "Collectie" is used for the human-readable label where it appears as a
 * content category; "collection" remains the IIIF term in identifiers.
 *
 * "IIIF-afbeeldingsdienst" – compound with hyphen because IIIF is an abbreviation.
 */
export const catalog = {
  resource: {
    create: "Resource aanmaken",
    chooseType: "Kies een resourcetype",
    label: "Label",
    url: "URL",
    invalidUrl: "Voer een geldige URL in",
    createFailed: "Deze resource kon niet worden aangemaakt",
  },
  canvas: {
    create: "Canvas aanmaken",
    width: "Breedte",
    height: "Hoogte",
    duration: "Duur",
  },
  image: {
    fromUrl: "URL van afbeelding",
    fromService: "IIIF-afbeeldingsdienst",
    browse: "Afbeeldingen bladeren",
    previewAlt: "Voorbeeld van geselecteerde resource",
    use: "Afbeelding gebruiken",
  },
  content: {
    webPage: "Webpagina",
    manifest: "Manifest",
    collection: "Collectie",
  },
} as const;
