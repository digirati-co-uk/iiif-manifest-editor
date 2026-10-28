/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Page vide",
      summary: "Commencez avec une mise en page d'image ou une page vierge",
    },
    internalCanvas: {
      label: "Page existante",
      summary: "Choisissez une page de cet élément.",
    },
    example: {
      label: "Exemple de page blanche",
      summary: "Créez une grande page blanche avec un titre.",
    },
    contents: {
      summary: "Créez une section pour organiser le contenu de cet élément.",
    },
    range: {
      summary: "Regroupez les pages ou d’autres sections dans une section.",
    },
    highlight: {
      summary: "Marquez une zone de la page sans ajouter de contenu.",
    },
    html: {
      summary: "Écrivez du texte formaté à afficher sur une page.",
    },
    browser: {
      summary:
        "Parcourez un élément IIIF, une collection ou une page Web de collection prise en charge et choisissez le contenu à ajouter.",
      copyMetadata: "Copier les détails de l'élément sur les pages importées",
      copyMetadataHelp: "Copie les détails descriptifs de l'élément source lorsque le navigateur crée une page.",
    },
    manifestBrowser: {
      summary: "Parcourez les articles et collections IIIF pour choisir quelque chose à ajouter.",
    },
    vtt: {
      summary: "Ajoutez des sous-titres ou des légendes d'un fichier WebVTT à une page audio ou vidéo.",
    },
  },
  browser: {
    selectCanvas: "Sélectionner une page",
    addToManifest: "Ajouter à l'article",
  },
  errors: {
    vttCanvas: "Les légendes WebVTT doivent appartenir à une page.",
    canvas: "Impossible de charger la page sélectionnée.",
    manifest: "Impossible de charger l'élément sélectionné.",
  },
  form: {
    vttHelp:
      "Liez un fichier WebVTT (.vtt) existant à cette page. Hébergez le fichier sur un URL public avant de l'ajouter.",
    createRange: "Créer une rubrique",
  },
  resource: {
    create: "Ajouter quelque chose",
    chooseType: "Choisissez quoi ajouter",
  },
  canvas: {
    create: "Ajouter une page",
  },
} as const;
