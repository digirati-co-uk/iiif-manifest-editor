/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "lienzo vacio",
      summary: "Comience con un diseño de imagen o un lienzo en blanco",
    },
    internalCanvas: {
      label: "Lienzo existente",
      summary: "Elija un lienzo de este manifiesto.",
    },
    example: {
      label: "Ejemplo de lienzo en blanco",
      summary: "Crea un gran lienzo en blanco con un título.",
    },
    thumbnail: {
      label: "Miniatura de IIIF",
      summary: "Cree una miniatura a partir de un servicio de imágenes IIIF.",
    },
    vtt: {
      label: "Subtítulos de WebVTT",
      summary: "Agregue subtítulos o leyendas de un archivo WebVTT a un lienzo de audio o video.",
    },
    contents: {
      label: "Tabla de contenido",
      summary: "Cree un rango de nivel superior para organizar el contenido del manifiesto.",
    },
    provider: {
      summary: "Agregue la organización responsable de proporcionar este recurso.",
    },
    browser: {
      label: "Explorar contenido IIIF",
      summary:
        "Explore una página web de manifiesto, colección o colección compatible de IIIF y elija el contenido que desea agregar.",
      copyMetadata: "Agregar metadatos de manifiesto a lienzos importados",
      copyMetadataHelp: "Copia metadatos del manifiesto de origen cuando IIIF Browser crea un lienzo.",
    },
    manifestBrowser: {
      summary: "Explore los manifiestos y colecciones de IIIF para elegir un recurso para agregar.",
    },
    audio: {
      label: "Audio",
      summary: "Agregue audio desde un enlace directo de archivo de audio.",
    },
    service: {
      label: "Imagen IIIF",
      summary: "Agregue una imagen ampliable utilizando un servicio de imágenes IIIF o un enlace info.json.",
    },
    highlight: {
      label: "Destacar",
      summary: "Marque una región del lienzo sin agregar ningún contenido.",
      create: "Crear resaltado",
    },
    annotationPage: {
      label: "Página de anotaciones vacía",
      summary: "Cree una página vacía para organizar las anotaciones.",
    },
    range: {
      summary: "Agrupe lienzos u otros rangos en una sección.",
    },
    imageList: {
      label: "Varias imágenes",
      summary: "Agregue varias imágenes usando un enlace de imagen directo por línea.",
    },
    plaintext: {
      label: "Enlace de texto sin formato",
      summary: "Enlace a un archivo de texto plano externo.",
    },
    htmlBody: {
      label: "Texto formateado",
      summary: "Escriba texto formateado como contenido de una anotación.",
    },
    html: {
      label: "HTML",
      summary: "Escriba texto formateado para mostrarlo en un lienzo.",
    },
    video: {
      label: "Video",
      summary: "Agregue video desde un enlace directo de archivo de video. Utilice YouTube para vídeos YouTube.",
    },
    imageUrl: {
      label: "Imagen",
      summary: "Agregue una imagen usando un enlace directo al archivo de imagen.",
    },
    captionedImage: {
      label: "Imagen subtitulada",
      summary: "Añade una imagen desde un enlace directo y escribe su título.",
    },
    youtube: {
      label: "YouTube",
      summary: "Inserte un vídeo utilizando su enlace YouTube.",
    },
    webpage: {
      label: "Página web",
      summary: "Enlace a una página web externa.",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} píxeles",
    audioUrl: "Enlace al archivo de audio",
    addAudio: "Agregar audio",
    videoUrl: "Enlace al archivo de vídeo",
    addVideo: "Añadir vídeo",
    serviceUrl: "Enlace al servicio de imágenes",
    invalidService: "Servicio no válido",
    imageUrl: "Enlace a la imagen",
    caption: "Subtítulo",
    describeImage: "Describe la imagen",
    textUrl: "Enlace al archivo de texto sin formato",
    youtubeUrl: "Enlace a YouTube",
    link: "Enlace",
    createLink: "Crear enlace",
    createRange: "Crear rango",
    addThumbnail: "Agregar miniatura",
    selectSize: "Selecciona talla",
    urlList: "Ingrese una lista de URL (una por línea)",
    homepageLabel: "Etiqueta de página de inicio",
    providerId: "ID del proveedor",
    providerIdHelp: "Se generará si no se especifica, este no es un URL que el usuario pueda seguir",
    addProvider: "Agregar proveedor",
    vttHelp:
      "Vincule un archivo WebVTT (.vtt) existente a este lienzo. Aloje el archivo en un URL público antes de agregarlo.",
    vttUrl: "Archivo WebVTT URL",
    absoluteUrl: "Introduzca un http:// o https:// absoluto URL",
    languageCode: "Idioma (código BCP 47)",
    languageCodeHelp: "Un código de idioma como en, fr o pt-BR",
    addCaptions: "Agregar subtítulos",
  },
  browser: {
    selectCanvas: "Seleccionar lienzo",
    select: "Seleccionar",
    addToManifest: "Agregar al manifiesto",
  },
  errors: {
    media: "No se pudo cargar este medio. Comprueba el enlace y vuelve a intentarlo.",
    details: "Detalles técnicos",
    service: "No se pudo cargar el servicio de imágenes. Comprueba el enlace y vuelve a intentarlo.",
    vttUrl: "Ingrese un HTTP o HTTPS URL absoluto para el archivo WebVTT.",
    vttCanvas: "Los subtítulos WebVTT deben pertenecer a un Canvas.",
    manifest: "No se pudo cargar el manifiesto seleccionado.",
    collection: "No se pudo cargar la colección seleccionada.",
    canvas: "No se pudo cargar el lienzo seleccionado.",
  },
  resource: {
    create: "Crear recurso",
    chooseType: "Elija un tipo de recurso",
    label: "Etiqueta",
    url: "URL",
    invalidUrl: "Ingrese un URL válido",
    createFailed: "No se pudo crear este recurso",
  },
  canvas: {
    create: "Crear lienzo",
    width: "Ancho",
    height: "Altura",
    duration: "Duración",
  },
  image: {
    fromUrl: "Imagen URL",
    fromService: "Servicio de imágenes IIIF",
    browse: "Explorar imágenes",
    previewAlt: "Vista previa del recurso seleccionado",
    use: "Usar imagen",
  },
  content: {
    webPage: "Página web",
    manifest: "Manifiesto",
    collection: "Recopilación",
  },
} as const;
