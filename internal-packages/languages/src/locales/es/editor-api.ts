/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Recopilación",
    manifest: "Manifiesto",
    canvas: "Lienzo",
    annotation: "Anotación",
    annotationPage: "Página de anotaciones",
    range: "Rango",
    annotationCollection: "colección de anotaciones",
    contentResource: "Recurso de contenido",
    agent: "Agente",
  },
  layout: {
    pair: "Juntos",
    triptych: "Tres columnas",
    featureLeft: "Característica restante",
    featureAbove: "Característica anterior",
    fourImages: "Cuatro imágenes",
    sixImages: "Seis imágenes",
    heroInset: "Héroe + recuadro",
    offsetPair: "par compensado",
    cascade: "Cascada",
    stacked: "apilados",
    scatter: "Dispersión",
    galleryWall: "pared de la galería",
    blank: "lienzo en blanco",
  },
  fields: {
    label: "Etiqueta",
    metadata: "Metadatos",
    summary: "Resumen",
    requiredStatement: "Declaración obligatoria",
    rights: "Derechos",
    provider: "Proveedor",
    thumbnail: "Uña del pulgar",
    navDate: "Fecha de navegación",
    placeholderCanvas: "Lienzo de marcador de posición",
    accompanyingCanvas: "Lienzo de acompañamiento",
    language: "Idioma",
    id: "Identificador",
    type: "Tipo",
    format: "Formato",
    profile: "Perfil",
    height: "Altura",
    width: "Ancho",
    duration: "Duración",
    viewingDirection: "Dirección de visión",
    behavior: "Comportamiento",
    timeMode: "Modo de hora",
    motivation: "Motivación",
    homepage: "Página principal",
    logo: "Logo",
    rendering: "Representación alternativa",
    service: "Servicio",
    services: "Servicios",
    seeAlso: "Descripción relacionada",
    partOf: "parte de",
    start: "Lienzo inicial",
    supplementary: "Contenido complementario",
    items: "Elementos",
    structures: "Estructuras",
    annotations: "Anotaciones",
    target: "Objetivo",
    body: "Cuerpo",
    navPlace: "Ubicación de navegación",
    textGranularity: "Granularidad del texto",
    value: "Valor",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Una lista ordenada de Manifiestos y/o Colecciones adicionales. Las colecciones permiten que los manifiestos y las colecciones secundarias se agrupen en una estructura jerárquica para su presentación, que puede usarse para generar navegación, mostrar resultados dinámicos de una búsqueda o proporcionar conjuntos fijos de recursos relacionados para cualquier otro propósito.",
      Manifest:
        "Una descripción de la estructura y propiedades del objeto compuesto. Contiene información necesaria para que el cliente presente el contenido al usuario, como un título y otra información descriptiva sobre el objeto o el trabajo intelectual que transmite. Cada Manifiesto suele describir cómo presentar un único objeto compuesto, como un libro, una estatua o un álbum de música.",
      Canvas:
        'Un contenedor virtual que representa una vista particular del objeto y tiene recursos de contenido asociados con él o con partes del mismo. El Canvas proporciona un marco de referencia para la disposición del contenido, tanto espacial como temporalmente. El concepto de lienzo se toma prestado de estándares como PDF y HTML, o aplicaciones como Photoshop y PowerPoint, donde una superficie de visualización inicialmente en blanco tiene imágenes, videos, texto y otro contenido "pintado" mediante anotaciones, recopiladas en páginas de anotaciones.',
      Range:
        "Una lista ordenada de lienzos y/o rangos adicionales. Los rangos permiten agrupar lienzos, o partes de ellos, de alguna manera. Esto podría deberse a razones basadas en el contenido, como las que se describen en un índice o en el conjunto de escenas de una obra de teatro. Del mismo modo, las características físicas pueden ser importantes, como la reunión de páginas en un libro antiguo o cuando la música grabada se divide en diferentes soportes físicos, como dos CD.",
      AnnotationPage:
        "Una lista ordenada de anotaciones que normalmente se asocia con un lienzo, pero a la que también se puede hacer referencia desde otros tipos de recursos. Las páginas de anotaciones recopilan y ordenan listas de anotaciones, que a su vez proporcionan comentarios sobre un recurso o contenido que forma parte de un lienzo.",
      Annotation:
        "Las anotaciones asocian recursos de contenido con lienzos. Se utiliza el mismo mecanismo para los recursos visibles y/o audibles que para las transcripciones, comentarios, etiquetas y otros contenidos. Esto proporciona un método único y unificado para alinear la información y proporciona un marco basado en estándares para distinguir partes de recursos y partes de Canvases. Como se pueden agregar anotaciones más adelante, promueve un sistema distribuido en el que los editores pueden alinear su contenido con las descripciones creadas por otros. La funcionalidad relacionada con las anotaciones también puede depender de otras clases como SpecificResource, Choice o Selectors.",
      ContentResource:
        "Recursos web como imágenes, audio, vídeo o texto que están asociados con un lienzo a través de una anotación o que proporcionan una representación de cualquier recurso.",
      AnnotationCollection:
        "Una lista ordenada de páginas de anotaciones. Las colecciones de anotaciones permiten registrar agrupaciones de anotaciones de nivel superior. Por ejemplo, todas las anotaciones de la traducción al inglés de un documento francés medieval podrían mantenerse separadas de la transcripción o de una edición en francés moderno, o el comentario del director sobre una película puede separarse del guión.",
    },
    descriptive: {
      label:
        "Una etiqueta, nombre o título legible por humanos. La propiedad de la etiqueta está destinada a mostrarse como un sustituto textual breve del recurso si un humano necesita hacer una distinción entre este y recursos similares, por ejemplo, entre objetos, páginas u opciones para una selección de imágenes para mostrar. La propiedad de la etiqueta se puede internacionalizar completamente y cada idioma puede tener múltiples valores.",
      metadata:
        "Una lista ordenada de descripciones que se mostrarán al usuario cuando interactúe con el recurso, presentadas como pares de etiquetas y entradas de valores legibles por humanos. El contenido de estas entradas está destinado únicamente a presentación; No se debe inferir la semántica descriptiva. Se puede utilizar una entrada para transmitir información sobre la creación del objeto, una descripción física, información de propiedad u otros propósitos.",
      summary:
        "Un breve resumen textual destinado a ser transmitido al usuario cuando no se muestran las entradas de metadatos del recurso. Esto podría usarse como una breve descripción para los resultados de búsqueda a nivel de elemento, para entornos de pantalla pequeña o como una interfaz de usuario alternativa cuando la propiedad de metadatos no se está representando actualmente. La propiedad de resumen sigue el mismo patrón que la propiedad de etiqueta descrita anteriormente.",
      requiredStatement:
        "Texto que debe mostrarse cuando se muestra o utiliza el recurso. Por ejemplo, la propiedad requiredStatement podría usarse para presentar declaraciones de propiedad o derechos de autor, un reconocimiento de la institución propietaria o editorial, o cualquier otro texto que la organización editorial considere fundamental mostrar al usuario. Dada la amplia variación de posibles interfaces de usuario de clientes, no siempre será posible mostrar esta declaración al usuario en el estado inicial del cliente. Si inicialmente está oculto, los clientes deben hacer que el método para revelarlo sea lo más obvio posible.",
      rights:
        "Una cadena que identifica una licencia o declaración de derechos que se aplica al contenido del recurso, como el JSON de un manifiesto o los píxeles de una imagen. El valor debe extraerse del conjunto de URI de licencia Creative Commons, los URI de declaración de derechos de RightsStatements.org o aquellos agregados mediante el mecanismo de extensión. La inclusión de esta propiedad es informativa y, por ejemplo, podría usarse para mostrar un icono que represente las afirmaciones de derechos.",
      provider:
        "Una organización o persona que contribuyó a proporcionar el contenido del recurso. Luego, los clientes pueden mostrar esta información al usuario para reconocer las contribuciones del proveedor. Esto difiere de la propiedad requiredStatement en que los datos están estructurados, lo que permite al cliente hacer más que solo presentar texto, sino tener información más rica sobre las personas y organizaciones para usar en diferentes interfaces.",
      thumbnail:
        "Un recurso de contenido, como una imagen pequeña o un clip de audio corto, que representa el recurso que tiene la propiedad de miniatura. Un recurso puede tener varios recursos en miniatura que tengan el mismo o diferente tipo y formato.",
      navDate:
        "Una fecha que los clientes pueden usar con fines de navegación al presentar el recurso al usuario en una interfaz de usuario basada en fechas, como un calendario o una línea de tiempo. En la propiedad de metadatos para consumo humano se deben incluir intervalos de fechas más descriptivos, destinados a mostrarse directamente al usuario. Si el recurso contiene lienzos que tienen la propiedad de duración, la fecha y hora proporcionada corresponde a la fecha y hora de navegación del inicio del recurso. Por ejemplo, un Rango que incluye un Lienzo que representa un conjunto de contenido de video que graba un evento histórico, el navDate es la fecha y hora del primer momento del evento grabado.",
      placeholderCanvas:
        "Un lienzo único que proporciona contenido adicional para su uso antes de que se represente el contenido principal del recurso que tiene la propiedad placeholderCanvas, o como anuncio o sustituto de ese contenido. Los ejemplos incluyen imágenes, texto y sonido que reemplazan el contenido de video antes de que el usuario inicie la reproducción; o un cartel de película para llamar la atención del usuario. El contenido proporcionado por placeholderCanvas difiere de una miniatura: un cliente puede usar una miniatura para resumir y navegar por múltiples recursos y luego mostrar el contenido de placeholderCanvas como parte de la presentación inicial de un único recurso. Es probable que un lienzo de marcador de posición tenga dimensiones diferentes a las de los lienzos del recurso que tiene la propiedad placeholderCanvas.",
      accompanyingCanvas:
        "Un único Canvas que proporciona contenido adicional para su uso mientras representa el recurso que tiene la propiedad accompanyingCanvas. Los ejemplos incluyen una imagen para mostrar mientras un Canvas de solo duración reproduce audio; o audio de fondo para reproducir mientras un usuario navega por un manifiesto de solo imagen.",
      language:
        "El idioma o idiomas utilizados en el contenido de este recurso externo. Esta propiedad ya está disponible en el modelo de anotación web para recursos de contenido que son el cuerpo o el destino de una anotación; sin embargo, también se puede usar para recursos a los que se hace referencia desde la página de inicio, la representación y partOf.",
    },
    technical: {
      id: "El URI que identifica el recurso. Si el recurso solo está disponible integrado dentro de otro recurso, como un rango dentro de un manifiesto, entonces el URI puede ser el URI del recurso integrado con un fragmento único al final. Esto no es cierto para los Canvas, que deben tener su propio URI sin fragmento.",
      type: "El tipo o clase del recurso. Para clases definidas para esta especificación",
      format:
        "El tipo de medio específico (a menudo denominado tipo MIME) para un recurso de contenido, por ejemplo, imagen/jpeg. Esto es importante para distinguir diferentes formatos del mismo tipo general de recurso, como distinguir el texto en XML del texto sin formato.",
      profile:
        "Un esquema o conjunto de funciones con nombre disponible en el recurso. El perfil puede aclarar aún más el tipo y/o formato de un recurso o servicio externo, permitiendo a los clientes personalizar su manejo del recurso que tiene la propiedad del perfil.",
      height:
        "La altura del lienzo o recurso de contenido externo. Para los recursos de contenido, el valor está en píxeles. Para Canvases, el valor no tiene unidad. En combinación con el ancho, transmite una relación de aspecto para el espacio en el que se encuentran los recursos de contenido.",
      width:
        "El ancho del lienzo o recurso de contenido externo. Para los recursos de contenido, el valor está en píxeles. Para Canvases, el valor no tiene unidad. En combinación con la altura, transmite una relación de aspecto para el espacio en el que se encuentran los recursos de contenido.",
      duration: "La duración del Canvas o recurso de contenido externo, expresada en segundos.",
      viewingDirection:
        "La dirección en la que se debe mostrar al usuario un conjunto de lienzos. Esta especificación define cuatro valores de dirección en la siguiente tabla. Otros pueden definirse externamente como una extensión.",
      behavior:
        "Un conjunto de características de experiencia de usuario que el editor del contenido preferiría que el cliente utilizara al presentar el recurso. Esta especificación define los valores en la siguiente tabla. Otros pueden definirse externamente como una extensión.",
      timeMode:
        "Un modo asociado con una Anotación que se aplicará a la representación de cualquier medio basado en el tiempo, o que de otro modo podría considerarse que tiene una duración, utilizado como recurso corporal de esa Anotación. Tenga en cuenta que la asociación de timeMode con la anotación significa que diferentes recursos en el cuerpo no pueden tener valores diferentes. Esta especificación define los valores especificados en la siguiente tabla. Otros pueden definirse externamente como una extensión.",
      motivation:
        'Esta especificación define dos valores para la propiedad de motivación o propósito de la anotación web cuando se usa en un recurso específico o Textual Body. Los recursos asociados con un lienzo mediante una anotación que tenga el valor de motivación "painting" deben presentarse al usuario como la representación del lienzo. Los recursos asociados con un lienzo mediante una anotación que tiene el valor de motivación supplementing pueden presentarse al usuario como parte de la representación del lienzo o pueden presentarse en una parte diferente de la interfaz de usuario.',
    },
    linking: {
      homepage:
        "Una página web que trata sobre el objeto representado por el recurso que tiene la propiedad de página de inicio. La página web suele ser publicada por la organización responsable del objeto y puede ser generada por un sistema de gestión de contenidos u otro sistema de catalogación. El recurso debe poder mostrarse directamente al usuario. Los recursos que están relacionados, pero no las páginas de inicio, deben agregarse a la propiedad de metadatos, con una etiqueta o valor apropiado para describir la relación.",
      logo: "Un pequeño recurso de imagen que representa el recurso del Agente al que está asociado. El logotipo debe mostrarse claramente cuando se muestra o utiliza el recurso, sin recortar, rotar ni distorsionar de otro modo la imagen. Se recomienda que un servicio API de imágenes IIIF esté disponible para esta imagen para otras manipulaciones como el cambio de tamaño.",
      rendering:
        "Un recurso que es una representación alternativa, no IIIF, del recurso que tiene la propiedad de representación. Por lo general, estas representaciones no se pueden pintar en un solo lienzo, ya que incluyen demasiadas vistas, tienen dimensiones incompatibles o son recursos compuestos que requieren una funcionalidad de representación adicional. El recurso de representación debe poder mostrarse directamente a un usuario humano, aunque la presentación puede estar fuera del cliente IIIF. El recurso no debe tener una página de presentación u otro recurso intersticial que facilite el acceso al mismo. Si se requiere control de acceso, se recomienda la API de autenticación IIIF. Los ejemplos incluyen una representación de un libro como PDF o EPUB, una plataforma de diapositivas con imágenes de un edificio o un modelo 3D de una estatua.",
      service:
        "Un servicio con el que el cliente puede interactuar directamente y obtener información o funcionalidad adicional para usar el recurso que tiene la propiedad de servicio, como desde una imagen al URI base de un servicio API de imagen IIIF asociado. El recurso de servicio debe tener información adicional asociada para permitir al cliente determinar cómo hacer un uso apropiado del mismo. Consulte el documento de Registro de servicios para obtener detalles de los tipos de servicios conocidos actualmente.",
      services:
        "Una lista de una o más definiciones de servicios en el recurso superior del documento, que normalmente son compartidas por más de un recurso posterior. Esto permite que estos servicios compartidos se recopilen juntos en un solo lugar, en lugar de tener su información potencialmente duplicada muchas veces a lo largo del documento, o requerir que un cliente consumidor recorra toda la estructura del documento para encontrar la información. El recurso al que se aplica el servicio aún debe tener la propiedad de servicio, como se describe anteriormente, donde los recursos del servicio tienen al menos las propiedades id y type o @id y @type. Esto le permite al cliente saber que el servicio se aplica a ese recurso. El uso de la propiedad de los servicios queda a discreción del sistema de publicación.",
      seeAlso:
        "Un recurso legible por máquina, como una descripción XML o RDF que está relacionada con el recurso actual que tiene la propiedad seeAlso. Se deben proporcionar propiedades del recurso para ayudar al cliente a seleccionar entre múltiples descripciones (si se proporcionan) y hacer un uso apropiado del documento. Si la relación entre el recurso y el documento necesita ser más específica, entonces el documento debe incluir esa relación en lugar del recurso IIIF. Otros recursos de IIIF también son objetivos válidos para seeAlso, por ejemplo, para vincular a un manifiesto que describe un objeto relacionado. El URI del documento debe identificar una representación única de los datos en un formato particular. Por ejemplo, si existen los mismos datos en JSON y XML, entonces se deben agregar recursos separados para cada representación, con distintas propiedades de identificación y formato.",
      partOf:
        "Un recurso contenedor que incluye el recurso que tiene la propiedad partOf. Cuando un cliente encuentra la propiedad partOf, puede recuperar el recurso contenedor al que se hace referencia, si no está incrustado en la representación actual, para contribuir al procesamiento del recurso contenido. Por ejemplo, la propiedad partOf en un lienzo se puede utilizar para hacer referencia a un manifiesto externo para permitir el descubrimiento de más información relevante. De manera similar, un Manifiesto puede hacer referencia a una Colección que lo contiene usando partOf para ayudar en la navegación.",
      start:
        "Un Canvas, o parte de un Canvas, que el cliente debe mostrar en la inicialización del recurso que tiene la propiedad de inicio. La referencia a parte de un lienzo se maneja de la misma manera que los rangos hacen referencia a partes de lienzos. Esta propiedad permite al cliente comenzar con el primer lienzo que contenga contenido interesante en lugar de requerir que el usuario navegue manualmente para encontrarlo.",
      supplementary:
        "Un enlace de este rango a una colección de anotaciones que incluye las anotaciones supplementing de recursos de contenido para el rango. Los clientes pueden usar esto para presentar contenido adicional al usuario desde un lienzo diferente al interactuar con el rango, o para saltar a la siguiente parte del rango dentro del mismo lienzo. Por ejemplo, el Rango podría representar un artículo de periódico que abarca páginas no secuenciales y luego usar la propiedad suplementaria para hacer referencia a una Colección de anotaciones que consta de las Anotaciones que registran el texto, divididas en Páginas de anotaciones por página de periódico. Alternativamente, el Rango podría representar las partes de un manuscrito que han sido transcritas o traducidas, cuando hay otras partes en las que aún no se ha trabajado. La Colección de Anotaciones serían las Anotaciones que transcriben o traducen, respectivamente.",
    },
    structural: {
      items:
        "Gran parte de la funcionalidad de la API de presentación IIIF consiste simplemente en registrar el orden en que aparecen los recursos secundarios dentro de un recurso principal, como colecciones o manifiestos dentro de una colección principal o lienzos dentro de un manifiesto. Todas estas situaciones están cubiertas por una única propiedad, los artículos.",
      structures:
        'La estructura de un objeto representado como Manifiesto se puede describir utilizando una jerarquía de Rangos. Los rangos se pueden utilizar para describir la "tabla de contenido" del objeto u otras estructuras con las que el usuario puede interactuar más allá del orden dado por la propiedad de elementos del Manifiesto. La jerarquía se construye anidando los recursos del rango secundario en la matriz de elementos del rango de nivel superior. Los rangos de nivel superior de estas jerarquías se proporcionan en la propiedad de estructuras.',
      annotations:
        "Una lista ordenada de páginas de anotaciones que contienen comentarios u otras anotaciones sobre este recurso, separadas de las anotaciones que se utilizan para pintar contenido en un lienzo. La motivación de las Anotaciones no debe ser painting, y el destino de las Anotaciones debe incluir este recurso o parte del mismo.",
    },
    attribution:
      "Copyright © 2012-2023 Editores y colaboradores. Publicado por el Consorcio IIIF bajo licencia CC-BY, ver descargo de responsabilidad.",
  },
  behavior: {
    groups: {
      autoAdvance: "Avance automático",
      repeat: "Repetir",
      manifestOrdering: "Ordenamiento manifiesto",
      canvasOrdering: "Pedido de lienzos",
      collection: "Recopilación",
      range: "Rango",
      collectionOrdering: "Orden de colección",
      rangeOrdering: "Orden de rango",
      hidden: "Visibilidad",
    },
    values: {
      "auto-advance": "Avance automático",
      "no-auto-advance": "Sin avance automático",
      repeat: "Repetir",
      "no-repeat": "No repetir",
      unordered: "desordenado",
      individuals: "Lienzos individuales",
      continuous: "Continuo",
      paged: "paginado",
      "facing-pages": "páginas opuestas",
      "non-paged": "No paginado",
      "multi-part": "varias partes",
      together: "Juntos",
      sequence: "Secuencia",
      "thumbnail-nav": "Navegación en miniatura",
      "no-nav": "Sin navegación",
      hidden: "Oculto",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Atribución-NoComercial-SinDerivadas",
      description:
        "Esta licencia es la más restrictiva de nuestras seis licencias principales, y solo permite que otros descarguen sus obras y las compartan con otros siempre que le den crédito, pero no pueden cambiarlas de ninguna manera ni utilizarlas comercialmente.",
    },
    attributionNonCommercialShareAlike: {
      label: "Atribución-NoComercial-CompartirIgual",
      description:
        "Esta licencia permite a otros remezclar, adaptar y desarrollar su trabajo sin fines comerciales, siempre y cuando le den crédito y concedan licencias para sus nuevas creaciones bajo los mismos términos.",
    },
    attributionNonCommercial: {
      label: "Atribución-No comercial",
      description:
        "Esta licencia permite a otros remezclar, adaptar y desarrollar su trabajo de manera no comercial, y aunque sus nuevos trabajos también deben reconocerlo y no ser comerciales, no tienen que licenciar sus trabajos derivados en los mismos términos.",
    },
    attributionNoDerivs: {
      label: "Atribución-SinDerivadas",
      description:
        "Esta licencia permite a otros reutilizar la obra para cualquier fin, incluso comercial; sin embargo, no se puede compartir con otros en forma adaptada y se le debe proporcionar crédito.",
    },
    attributionShareAlike: {
      label: "Atribución-CompartirIgual",
      description:
        "Esta licencia permite a otros remezclar, adaptar y desarrollar su trabajo incluso con fines comerciales, siempre que le den crédito y concedan licencias para sus nuevas creaciones bajo los mismos términos. Esta licencia a menudo se compara con las licencias de software libre y de código abierto “copyleft”. Todos los trabajos nuevos basados ​​en el tuyo tendrán la misma licencia, por lo que cualquier derivado también permitirá el uso comercial. Esta es la licencia utilizada por Wikipedia y se recomienda para materiales que se beneficiarían al incorporar contenido de Wikipedia y proyectos con licencias similares.",
    },
    attribution: {
      label: "Atribución",
      description:
        "Esta licencia permite a otros distribuir, remezclar, adaptar y desarrollar su trabajo, incluso comercialmente, siempre que le den crédito por la creación original. Esta es la licencia más flexible que se ofrece. Recomendado para máxima difusión y uso de materiales licenciados.",
    },
    publicDomain: {
      label: "Dominio público",
      description:
        "La persona que asoció una obra con esta escritura ha dedicado la obra al dominio público renunciando a todos sus derechos sobre la obra en todo el mundo según la ley de derechos de autor, incluidos todos los derechos relacionados y conexos, en la medida permitida por la ley.",
    },
  },
  sizes: {
    landscape: "12×8 · Paisaje",
    wide: "12×6 · Ancho",
    square: "12×12 · Cuadrado",
    portrait: "8 × 12 · Retrato",
  },
} as const;
