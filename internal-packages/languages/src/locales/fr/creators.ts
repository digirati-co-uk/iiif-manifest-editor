/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Toile vide",
      summary: "Commencez avec une mise en page d'image ou une toile vierge",
    },
    internalCanvas: {
      label: "Toile existante",
      summary: "Choisissez un canevas dans ce manifeste.",
    },
    example: {
      label: "Exemple de toile vierge",
      summary: "Créez une grande toile vierge avec un titre.",
    },
    thumbnail: {
      label: "Miniature IIIF",
      summary: "Créez une miniature à partir d'un service d'imagerie IIIF.",
    },
    vtt: {
      label: "Légendes WebVTT",
      summary: "Ajoutez des sous-titres ou des légendes d'un fichier WebVTT à un canevas audio ou vidéo.",
    },
    contents: {
      label: "Table des matières",
      summary: "Créez une plage de niveau supérieur pour organiser le contenu du manifeste.",
    },
    provider: {
      summary: "Ajoutez l’organisation responsable de fournir cette ressource.",
    },
    browser: {
      label: "Parcourir le contenu de IIIF",
      summary:
        "Parcourez un manifeste IIIF, une collection ou une page Web de collection prise en charge et choisissez le contenu à ajouter.",
      copyMetadata: "Ajouter des métadonnées de manifeste aux canevas importés",
      copyMetadataHelp: "Copie les métadonnées du manifeste source lorsque le IIIF Browser crée un canevas.",
    },
    manifestBrowser: {
      summary: "Parcourez les manifestes et les collections IIIF pour choisir une ressource à ajouter.",
    },
    audio: {
      label: "Audio",
      summary: "Ajoutez de l'audio à partir d'un lien direct vers un fichier audio.",
    },
    service: {
      label: "Image IIIF",
      summary: "Ajoutez une image zoomable à l'aide d'un service d'imagerie IIIF ou d'un lien info.json.",
    },
    highlight: {
      label: "Souligner",
      summary: "Marquez une région du canevas sans ajouter de contenu.",
      create: "Créer un point culminant",
    },
    annotationPage: {
      label: "Page d'annotation vide",
      summary: "Créez une page vide pour organiser les annotations.",
    },
    range: {
      summary: "Regroupez les toiles ou d’autres plages dans une section.",
    },
    imageList: {
      label: "Plusieurs images",
      summary: "Ajoutez plusieurs images en utilisant un lien d’image direct par ligne.",
    },
    plaintext: {
      label: "Lien en texte brut",
      summary: "Lien vers un fichier texte brut externe.",
    },
    htmlBody: {
      label: "Texte formaté",
      summary: "Écrivez du texte formaté comme contenu d'une annotation.",
    },
    html: {
      label: "HTML",
      summary: "Écrivez du texte formaté à afficher sur un canevas.",
    },
    video: {
      label: "Vidéo",
      summary:
        "Ajoutez une vidéo à partir d’un lien direct vers un fichier vidéo. Utilisez YouTube pour les vidéos YouTube.",
    },
    imageUrl: {
      label: "Image",
      summary: "Ajoutez une image à l’aide d’un lien direct vers un fichier image.",
    },
    captionedImage: {
      label: "Image sous-titré",
      summary: "Ajoutez une image à partir d'un lien direct et écrivez sa légende.",
    },
    youtube: {
      label: "YouTube",
      summary: "Intégrez une vidéo en utilisant son lien YouTube.",
    },
    webpage: {
      label: "page web",
      summary: "Lien vers une page Web externe.",
    },
  },
  form: {
    dimensions: "Pixels {{width}} × {{height}}",
    audioUrl: "Lien vers le fichier audio",
    addAudio: "Ajouter du son",
    videoUrl: "Lien vers le fichier vidéo",
    addVideo: "Ajouter une vidéo",
    serviceUrl: "Lien vers le service d'images",
    invalidService: "Service invalide",
    imageUrl: "Lien vers l'image",
    caption: "Légende",
    describeImage: "Décrivez l'image",
    textUrl: "Lien vers le fichier texte brut",
    youtubeUrl: "Lien vers YouTube",
    link: "Lien",
    createLink: "Créer un lien",
    createRange: "Créer une plage",
    addThumbnail: "Ajouter une miniature",
    selectSize: "Sélectionnez la taille",
    urlList: "Saisissez une liste d'URL (une par ligne)",
    homepageLabel: "Libellé de la page d'accueil",
    providerId: "Identifiant du fournisseur",
    providerIdHelp: "Sera généré si non spécifié, ce n'est pas un URL que l'utilisateur peut suivre",
    addProvider: "Ajouter un fournisseur",
    vttHelp:
      "Liez un fichier WebVTT (.vtt) existant à ce canevas. Hébergez le fichier sur un URL public avant de l'ajouter.",
    vttUrl: "Fichier WebVTT URL",
    absoluteUrl: "Entrez un http:// ou https:// absolu URL",
    languageCode: "Langue (code BCP 47)",
    languageCodeHelp: "Un code de langue tel que en, fr ou pt-BR",
    addCaptions: "Ajouter des légendes",
  },
  browser: {
    selectCanvas: "Sélectionnez la toile",
    select: "Sélectionner",
    addToManifest: "Ajouter au manifeste",
  },
  errors: {
    media: "Impossible de charger ce média. Vérifiez le lien et réessayez.",
    details: "Détails techniques",
    service: "Impossible de charger le service d'imagerie. Vérifiez le lien et réessayez.",
    vttUrl: "Entrez un HTTP absolu ou un HTTPS URL pour le fichier WebVTT.",
    vttCanvas: "Les légendes WebVTT doivent appartenir à un canevas.",
    manifest: "Impossible de charger le manifeste sélectionné.",
    collection: "Impossible de charger la collection sélectionnée.",
    canvas: "Impossible de charger le canevas sélectionné.",
  },
  resource: {
    create: "Créer une ressource",
    chooseType: "Choisissez un type de ressource",
    label: "Libellé",
    url: "URL",
    invalidUrl: "Entrez un URL valide",
    createFailed: "Impossible de créer cette ressource",
  },
  canvas: {
    create: "Créer une toile",
    width: "Largeur",
    height: "Hauteur",
    duration: "Durée",
  },
  image: {
    fromUrl: "Image URL",
    fromService: "Service d'imagerie IIIF",
    browse: "Parcourir les images",
    previewAlt: "Aperçu de la ressource sélectionnée",
    use: "Utiliser l'image",
  },
  content: {
    webPage: "page web",
    manifest: "Manifeste",
    collection: "Collection",
  },
} as const;
