/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "pagina vacia",
      summary: "Comience con un diseño de imagen o una página en blanco",
    },
    internalCanvas: {
      label: "Página existente",
      summary: "Elija una página de este artículo.",
    },
    example: {
      label: "Ejemplo de página en blanco",
      summary: "Crea una página grande en blanco con un título.",
    },
    contents: {
      summary: "Cree una sección para organizar el contenido de este elemento.",
    },
    range: {
      summary: "Agrupe páginas u otras secciones en una sección.",
    },
    highlight: {
      summary: "Marque un área de la página sin agregar contenido.",
    },
    html: {
      summary: "Escriba texto formateado para mostrarlo en una página.",
    },
    browser: {
      summary:
        "Explore un elemento, una colección o una página web de colección admitida de IIIF y elija el contenido que desea agregar.",
      copyMetadata: "Copiar detalles del artículo a páginas importadas",
      copyMetadataHelp: "Copia detalles descriptivos del elemento de origen cuando el navegador crea una página.",
    },
    manifestBrowser: {
      summary: "Explore los artículos y colecciones de IIIF para elegir algo que agregar.",
    },
    vtt: {
      summary: "Agregue subtítulos o leyendas de un archivo WebVTT a una página de audio o video.",
    },
  },
  browser: {
    selectCanvas: "Seleccionar página",
    addToManifest: "Añadir al artículo",
  },
  errors: {
    vttCanvas: "Los subtítulos WebVTT deben pertenecer a una página.",
    canvas: "No se pudo cargar la página seleccionada.",
    manifest: "No se pudo cargar el elemento seleccionado.",
  },
  form: {
    vttHelp:
      "Vincule un archivo WebVTT (.vtt) existente a esta página. Aloje el archivo en un URL público antes de agregarlo.",
    createRange: "Crear sección",
  },
  resource: {
    create: "agrega algo",
    chooseType: "Elige qué agregar",
  },
  canvas: {
    create: "Agregar página",
  },
} as const;
