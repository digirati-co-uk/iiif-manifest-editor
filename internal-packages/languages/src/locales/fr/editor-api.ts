/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Collection",
    manifest: "Manifeste",
    canvas: "Canevas",
    annotation: "Annotation",
    annotationPage: "Page d'annotations",
    range: "Séquence",
    annotationCollection: "Collection d'annotations",
    contentResource: "Ressource de contenu",
    agent: "Agent",
  },
  layout: {
    pair: "Côte à côte",
    triptych: "Trois colonnes",
    featureLeft: "Fonctionnalité gauche",
    featureAbove: "Fonctionnalité ci-dessus",
    fourImages: "Quatre images",
    sixImages: "Six images",
    heroInset: "Héros + encart",
    offsetPair: "Paire décalée",
    cascade: "Cascade",
    stacked: "Empilé",
    scatter: "Dispersion",
    galleryWall: "Mur de galerie",
    blank: "Toile vierge",
  },
  fields: {
    label: "Libellé",
    metadata: "Métadonnées",
    summary: "Résumé",
    requiredStatement: "Mention obligatoire",
    rights: "Droits",
    provider: "Fournisseur",
    thumbnail: "Vignette",
    navDate: "Date de navigation",
    placeholderCanvas: "Canevas d'espace réservé",
    accompanyingCanvas: "Toile d'accompagnement",
    language: "Langue",
    id: "Identifiant",
    type: "Type",
    format: "Format",
    profile: "Profil",
    height: "Hauteur",
    width: "Largeur",
    duration: "Durée",
    viewingDirection: "Direction de visualisation",
    behavior: "Comportement",
    timeMode: "Mode heure",
    motivation: "Motivation",
    homepage: "Page d'accueil",
    logo: "Logo",
    rendering: "Représentation alternative",
    service: "Service",
    services: "Services",
    seeAlso: "Description associée",
    partOf: "Une partie de",
    start: "Toile de départ",
    supplementary: "Contenu supplémentaire",
    items: "Articles",
    structures: "Structures",
    annotations: "Annotations",
    target: "Cible",
    body: "Corps",
    navPlace: "Emplacement de navigation",
    textGranularity: "Granularité du texte",
    value: "Valeur",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Une liste ordonnée de manifestes et/ou d’autres collections. Les collections permettent de regrouper les manifestes et les collections enfants dans une structure hiérarchique pour la présentation, qui peut servir à générer une navigation, à afficher les résultats dynamiques d'une recherche ou à fournir des ensembles fixes de ressources associées à toute autre fin.",
      Manifest:
        "Une description de la structure et des propriétés de l'objet composé. Il contient les informations nécessaires au client pour présenter le contenu à l'utilisateur, telles qu'un titre et d'autres informations descriptives sur l'objet ou l'œuvre intellectuelle qu'il véhicule. Chaque manifeste décrit généralement comment présenter un seul objet composé tel qu'un livre, une statue ou un album de musique.",
      Canvas:
        "Conteneur virtuel qui représente une vue particulière de l'objet et auquel sont associées des ressources de contenu ou des parties de celui-ci. Le Canvas fournit un cadre de référence pour la disposition du contenu, à la fois spatialement et temporellement. Le concept de canevas est emprunté à des normes telles que PDF et HTML, ou à des applications telles que Photoshop et PowerPoint, où une surface d'affichage initialement vierge contient des images, des vidéos, du texte et d'autres contenus « peints » dessus par des annotations, collectées dans des pages d'annotation.",
      Range:
        "Une liste ordonnée de toiles et/ou de plages supplémentaires. Les plages permettent aux canevas, ou à des parties de ceux-ci, d'être regroupés d'une manière ou d'une autre. Cela peut être dû à des raisons liées au contenu, telles que celles qui peuvent être décrites dans une table des matières ou dans l'ensemble des scènes d'une pièce de théâtre. De même, les caractéristiques physiques peuvent être importantes, telles que les regroupements de pages dans un livre ancien ou lorsque la musique enregistrée est répartie sur différents supports physiques tels que deux CD.",
      AnnotationPage:
        "Une liste ordonnée d'annotations qui est généralement associée à un canevas mais qui peut également être référencée à partir d'autres types de ressources. Les pages d'annotation collectent et ordonnent des listes d'annotations, qui à leur tour fournissent des commentaires sur une ressource ou un contenu faisant partie d'un canevas.",
      Annotation:
        "Les annotations associent les ressources de contenu aux canevas. Le même mécanisme est utilisé pour les ressources visibles et/ou audibles que pour les transcriptions, commentaires, tags et autres contenus. Cela fournit une méthode unique et unifiée pour aligner les informations et fournit un cadre basé sur des normes pour distinguer les parties des ressources et les parties des canevas. Comme les annotations peuvent être ajoutées ultérieurement, cela favorise un système distribué dans lequel les éditeurs peuvent aligner leur contenu sur les descriptions créées par d'autres. Les fonctionnalités liées à l'annotation peuvent également s'appuyer sur d'autres classes telles que SpecificResource, Choice ou Selectors.",
      ContentResource:
        "Ressources Web telles que des images, de l'audio, de la vidéo ou du texte qui sont associées à un canevas via une annotation ou fournissent une représentation de n'importe quelle ressource.",
      AnnotationCollection:
        "Une liste ordonnée de pages d'annotation. Les collections d'annotations permettent d'enregistrer des regroupements d'annotations de niveau supérieur. Par exemple, toutes les annotations de la traduction anglaise d’un document français médiéval pourraient être séparées de la transcription ou d’une édition en français moderne, ou encore le commentaire du réalisateur sur un film peut être séparé du scénario.",
    },
    descriptive: {
      label:
        "Une étiquette, un nom ou un titre lisible par l'homme. La propriété label est destinée à être affichée comme un court substitut textuel de la ressource si un humain a besoin de faire une distinction entre celle-ci et des ressources similaires, par exemple entre des objets, des pages ou des options pour un choix d'images à afficher. La propriété label peut être entièrement internationalisée et chaque langue peut avoir plusieurs valeurs.",
      metadata:
        "Une liste ordonnée de descriptions à afficher à l'utilisateur lorsqu'il interagit avec la ressource, donnée sous forme de paires d'entrées d'étiquette et de valeur lisibles par l'homme. Le contenu de ces entrées est destiné uniquement à la présentation ; il ne faut pas en déduire une sémantique descriptive. Une entrée peut être utilisée pour transmettre des informations sur la création de l'objet, une description physique, des informations sur la propriété ou à d'autres fins.",
      summary:
        "Un court résumé textuel destiné à être transmis à l'utilisateur lorsque les entrées de métadonnées de la ressource ne sont pas affichées. Cela pourrait être utilisé comme brève description des résultats de recherche au niveau de l'élément, pour les environnements sur petit écran, ou comme interface utilisateur alternative lorsque la propriété de métadonnées n'est pas actuellement affichée. La propriété summary suit le même modèle que la propriété label décrite ci-dessus.",
      requiredStatement:
        "Texte qui doit être affiché lorsque la ressource est affichée ou utilisée. Par exemple, la propriété requiredStatement peut être utilisée pour présenter des déclarations de droits d'auteur ou de propriété, une reconnaissance de l'institution propriétaire et/ou éditrice, ou tout autre texte que l'organisation éditrice juge essentiel d'afficher à l'utilisateur. Compte tenu de la grande diversité des interfaces utilisateur client potentielles, il ne sera pas toujours possible d’afficher cette instruction à l’utilisateur dans l’état initial du client. S’il est initialement caché, les clients doivent rendre la méthode pour le révéler aussi évidente que possible.",
      rights:
        "Chaîne qui identifie une licence ou une déclaration de droits qui s'applique au contenu de la ressource, comme le JSON d'un manifeste ou les pixels d'une image. La valeur doit être extraite de l'ensemble des URI de licence Creative Commons, des URI de déclaration de droits RightsStatements.org ou de ceux ajoutés via le mécanisme d'extension. L'inclusion de cette propriété est informative et pourrait par exemple être utilisée pour afficher une icône représentant les affirmations de droits.",
      provider:
        "Une organisation ou une personne qui a contribué à fournir le contenu de la ressource. Les clients peuvent ensuite afficher ces informations à l'utilisateur pour reconnaître les contributions du fournisseur. Cela diffère de la propriété requiredStatement, dans la mesure où les données sont structurées, permettant au client de faire plus que simplement présenter du texte, mais de disposer d'informations plus riches sur les personnes et les organisations à utiliser dans différentes interfaces.",
      thumbnail:
        "Ressource de contenu, telle qu'une petite image ou un court clip audio, qui représente la ressource possédant la propriété miniature. Une ressource peut avoir plusieurs ressources miniatures qui ont un type et un format identiques ou différents.",
      navDate:
        "Date que les clients peuvent utiliser à des fins de navigation lors de la présentation de la ressource à l'utilisateur dans une interface utilisateur basée sur la date, telle qu'un calendrier ou une chronologie. Des plages de dates plus descriptives, destinées à être affichées directement à l'utilisateur, devraient être incluses dans la propriété de métadonnées pour la consommation humaine. Si la ressource contient des Canvas qui possèdent la propriété duration, la dateheure donnée correspond à la dateheure de navigation du début de la ressource. Par exemple, une plage qui inclut un canevas qui représente un ensemble de contenu vidéo enregistrant un événement historique, le navDate est la date/heure du premier moment de l'événement enregistré.",
      placeholderCanvas:
        "Un canevas unique qui fournit du contenu supplémentaire à utiliser avant le rendu du contenu principal de la ressource possédant la propriété placeholderCanvas, ou en tant que publicité ou remplacement de ce contenu. Les exemples incluent des images, du texte et du son remplaçant le contenu vidéo avant que l'utilisateur ne lance la lecture ; ou une affiche de film pour attirer l'attention des utilisateurs. Le contenu fourni par placeholderCanvas diffère d'une vignette : un client peut utiliser une vignette pour résumer et parcourir plusieurs ressources, puis afficher le contenu de placeholderCanvas dans le cadre de la présentation initiale d'une seule ressource. Un canevas d'espace réservé est susceptible d'avoir des dimensions différentes de celles du ou des canevas de la ressource qui possède la propriété placeholderCanvas.",
      accompanyingCanvas:
        "Un canevas unique qui fournit du contenu supplémentaire à utiliser lors du rendu de la ressource possédant la propriété accompanyingCanvas. Les exemples incluent une image à afficher pendant qu'un canevas de durée uniquement lit de l'audio ; ou un son d'arrière-plan à lire pendant qu'un utilisateur navigue dans un manifeste contenant uniquement des images.",
      language:
        "La ou les langues utilisées dans le contenu de cette ressource externe. Cette propriété est déjà disponible à partir du modèle d'annotation Web pour les ressources de contenu qui sont le corps ou la cible d'une annotation, mais elle peut également être utilisée pour les ressources référencées depuis la page d'accueil, le rendu et partOf.",
    },
    technical: {
      id: "Le URI qui identifie la ressource. Si la ressource est uniquement disponible intégrée dans une autre ressource, telle qu'une plage dans un manifeste, alors le URI peut être le URI de la ressource incorporée avec un fragment unique à la fin. Ce n'est pas vrai pour les Canvas, qui doivent avoir leur propre URI sans fragment.",
      type: "Le type ou la classe de la ressource. Pour les classes définies pour cette spécification",
      format:
        "Type de média spécifique (souvent appelé type MIME) pour une ressource de contenu, par exemple image/jpeg. Ceci est important pour distinguer différents formats du même type global de ressource, par exemple pour distinguer le texte dans XML du texte brut.",
      profile:
        "Un schéma ou un ensemble nommé de fonctionnalités disponibles à partir de la ressource. Le profil peut clarifier davantage le type et/ou le format d'une ressource ou d'un service externe, permettant aux clients de personnaliser leur gestion de la ressource possédant la propriété de profil.",
      height:
        "La hauteur du canevas ou de la ressource de contenu externe. Pour les ressources de contenu, la valeur est en pixels. Pour les Canvases, la valeur n’a pas d’unité. En combinaison avec la largeur, il transmet un rapport hauteur/largeur pour l'espace dans lequel se trouvent les ressources de contenu.",
      width:
        "La largeur du canevas ou de la ressource de contenu externe. Pour les ressources de contenu, la valeur est en pixels. Pour les Canvases, la valeur n’a pas d’unité. En combinaison avec la hauteur, il donne un rapport hauteur/largeur pour l'espace dans lequel se trouvent les ressources de contenu.",
      duration: "La durée du canevas ou de la ressource de contenu externe, donnée en secondes.",
      viewingDirection:
        "La direction dans laquelle un ensemble de canevas doit être affiché à l'utilisateur. Cette spécification définit quatre valeurs de direction dans le tableau ci-dessous. D'autres peuvent être définis extérieurement comme une extension.",
      behavior:
        "Un ensemble de fonctionnalités d'expérience utilisateur que l'éditeur du contenu préférerait que le client utilise lors de la présentation de la ressource. Cette spécification définit les valeurs dans le tableau ci-dessous. D'autres peuvent être définis extérieurement comme une extension.",
      timeMode:
        "Un mode associé à une annotation qui doit être appliqué au rendu de tout média temporel, ou qui pourrait autrement être considéré comme ayant une durée, utilisée comme ressource de corps de cette annotation. Notez que l'association de timeMode avec l'annotation signifie que différentes ressources dans le corps ne peuvent pas avoir des valeurs différentes. Cette spécification définit les valeurs spécifiées dans le tableau ci-dessous. D'autres peuvent être définis extérieurement comme une extension.",
      motivation:
        "Cette spécification définit deux valeurs pour la propriété d'annotation Web de motivation ou d'objectif lorsqu'elle est utilisée sur une ressource spécifique ou Textual Body. Les ressources associées à un Canvas par une Annotation qui a la valeur de motivation « painting » doivent être présentées à l'utilisateur comme la représentation du Canvas. Les ressources associées à un canevas par une annotation qui a la valeur de motivation supplementing peuvent être présentées à l'utilisateur dans le cadre de la représentation du canevas, ou peuvent être présentées dans une partie différente de l'interface utilisateur.",
    },
    linking: {
      homepage:
        "Une page Web relative à l'objet représenté par la ressource possédant la propriété homepage. La page Web est généralement publiée par l'organisation responsable de l'objet et peut être générée par un système de gestion de contenu ou un autre système de catalogage. La ressource doit pouvoir être affichée directement à l'utilisateur. Les ressources liées, mais pas les pages d'accueil, doivent plutôt être ajoutées dans la propriété des métadonnées, avec une étiquette ou une valeur appropriée pour décrire la relation.",
      logo: "Une petite ressource image qui représente la ressource Agent à laquelle elle est associée. Le logo doit être clairement rendu lorsque la ressource est affichée ou utilisée, sans recadrer, faire pivoter ou autrement déformer l'image. Il est recommandé qu'un service API d'image IIIF soit disponible pour cette image pour d'autres manipulations telles que le redimensionnement.",
      rendering:
        "Ressource qui est une représentation alternative non-IIIF de la ressource qui possède la propriété de rendu. De telles représentations ne peuvent généralement pas être peintes sur un seul canevas, car soit elles incluent trop de vues, ont des dimensions incompatibles ou sont des ressources composées nécessitant des fonctionnalités de rendu supplémentaires. La ressource de rendu doit pouvoir être affichée directement à un utilisateur humain, bien que la présentation puisse être en dehors du client IIIF. La ressource ne doit pas avoir de page de garde ou autre ressource interstitielle qui en facilite l'accès. Si un contrôle d'accès est requis, l'API d'authentification IIIF est recommandée. Les exemples incluent le rendu d'un livre sous la forme PDF ou EPUB, un diaporama avec des images d'un bâtiment ou un modèle 3D d'une statue.",
      service:
        "Service avec lequel le client peut interagir directement et obtenir des informations ou des fonctionnalités supplémentaires pour utiliser la ressource qui possède la propriété de service, par exemple depuis une image vers le URI de base d'un service API d'image IIIF associé. La ressource de service doit être associée à des informations supplémentaires afin de permettre au client de déterminer comment en faire un usage approprié. Veuillez consulter le document Service Registry pour plus de détails sur les types de services actuellement connus.",
      services:
        "Liste d'une ou plusieurs définitions de service sur la ressource la plus élevée du document, qui sont généralement partagées par plusieurs ressources suivantes. Cela permet à ces services partagés d'être rassemblés en un seul endroit, plutôt que de voir leurs informations potentiellement dupliquées plusieurs fois dans le document, ou de demander à un client consommateur de parcourir l'intégralité de la structure du document pour trouver les informations. La ressource à laquelle le service s'applique doit toujours avoir la propriété service, comme décrit ci-dessus, où les ressources du service ont au moins les propriétés id et type ou @id et @type. Cela permet au client de savoir que le service s'applique à cette ressource. L'utilisation de la propriété des services est à la discrétion du système de publication.",
      seeAlso:
        "Ressource lisible par machine, telle qu'une description XML ou RDF, liée à la ressource actuelle possédant la propriété seeAlso. Les propriétés de la ressource doivent être indiquées pour aider le client à choisir entre plusieurs descriptions (si fournies) et à faire un usage approprié du document. Si la relation entre la ressource et le document doit être plus spécifique, le document doit alors inclure cette relation plutôt que la ressource IIIF. D'autres ressources IIIF sont également des cibles valides pour seeAlso, par exemple pour créer un lien vers un manifeste qui décrit un objet associé. Le URI du document doit identifier une représentation unique des données dans un format particulier. Par exemple, si les mêmes données existent dans JSON et XML, des ressources distinctes doivent être ajoutées pour chaque représentation, avec des propriétés d'identifiant et de format distinctes.",
      partOf:
        "Ressource conteneur qui inclut la ressource possédant la propriété partOf. Lorsqu'un client rencontre la propriété partOf, il peut récupérer la ressource conteneur référencée, si elle n'est pas intégrée dans la représentation actuelle, afin de contribuer au traitement de la ressource contenue. Par exemple, la propriété partOf sur un canevas peut être utilisée pour référencer un manifeste externe afin de permettre la découverte d'informations pertinentes supplémentaires. De même, un manifeste peut référencer une collection contenant en utilisant partOf pour faciliter la navigation.",
      start:
        "Un canevas, ou une partie d'un canevas, que le client doit afficher lors de l'initialisation de la ressource qui possède la propriété start. La référence à une partie d’un canevas est gérée de la même manière que les plages font référence à des parties de canevas. Cette propriété permet au client de commencer par le premier canevas contenant un contenu intéressant plutôt que de demander à l'utilisateur de naviguer manuellement pour le trouver.",
      supplementary:
        "Un lien de cette plage vers une collection d'annotations qui inclut les annotations supplementing des ressources de contenu pour la plage. Les clients peuvent l'utiliser pour présenter du contenu supplémentaire à l'utilisateur à partir d'un canevas différent lors de l'interaction avec la plage, ou pour passer à la partie suivante de la plage dans le même canevas. Par exemple, Range peut représenter un article de journal qui s'étend sur des pages non séquentielles, puis utiliser la propriété supplémentaire pour référencer une collection d'annotations composée des annotations qui enregistrent le texte, divisées en pages d'annotation par page de journal. Alternativement, la plage peut représenter les parties d'un manuscrit qui ont été transcrites ou traduites, alors que d'autres parties doivent encore être travaillées. La collection d'annotations serait les annotations qui transcrivent ou traduisent, respectivement.",
    },
    structural: {
      items:
        "Une grande partie des fonctionnalités de l'API de présentation IIIF consiste simplement à enregistrer l'ordre dans lequel les ressources enfants apparaissent au sein d'une ressource parent, comme des collections ou des manifestes au sein d'une collection parent, ou des canevas au sein d'un manifeste. Toutes ces situations sont couvertes par une seule propriété, les éléments.",
      structures:
        "La structure d'un objet représenté sous forme de manifeste peut être décrite à l'aide d'une hiérarchie de plages. Les plages peuvent être utilisées pour décrire la « table des matières » de l'objet ou d'autres structures avec lesquelles l'utilisateur peut interagir au-delà de l'ordre donné par la propriété items du Manifest. La hiérarchie est construite en imbriquant les ressources Range enfants dans le tableau items de la Range de niveau supérieur. Les plages de niveau supérieur de ces hiérarchies sont indiquées dans la propriété structures.",
      annotations:
        "Une liste ordonnée de pages d'annotation contenant des commentaires ou d'autres annotations sur cette ressource, distinctes des annotations utilisées pour peindre du contenu sur un canevas. La motivation des Annotations ne doit pas être painting, et la cible des Annotations doit inclure cette ressource ou une partie de celle-ci.",
    },
    attribution:
      "Copyright © 2012-2023 Éditeurs et contributeurs. Publié par le Consortium IIIF sous licence CC-BY, voir clause de non-responsabilité.",
  },
  behavior: {
    groups: {
      autoAdvance: "Avance automatique",
      repeat: "Répéter",
      manifestOrdering: "Commande de manifeste",
      canvasOrdering: "Commande de toile",
      collection: "Collection",
      range: "Séquence",
      collectionOrdering: "Commande de collecte",
      rangeOrdering: "Ordre des plages",
      hidden: "Visibilité",
    },
    values: {
      "auto-advance": "Avance automatique",
      "no-auto-advance": "Pas d'avance automatique",
      repeat: "Répéter",
      "no-repeat": "Pas de répétition",
      unordered: "Non commandé",
      individuals: "Toiles individuelles",
      continuous: "Continu",
      paged: "Paginé",
      "facing-pages": "Pages en regard",
      "non-paged": "Non paginé",
      "multi-part": "En plusieurs parties",
      together: "Ensemble",
      sequence: "Séquence",
      "thumbnail-nav": "Navigation par vignettes",
      "no-nav": "Pas de navigation",
      hidden: "Caché",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Attribution-NonCommercial-NoDerivs",
      description:
        "Cette licence est la plus restrictive de nos six licences principales, permettant uniquement à d'autres de télécharger vos œuvres et de les partager avec d'autres tant qu'ils vous créditent, mais ils ne peuvent en aucun cas les modifier ni les utiliser commercialement.",
    },
    attributionNonCommercialShareAlike: {
      label: "Attribution-NonCommercial-ShareAlike",
      description:
        "Cette licence permet à d'autres de remixer, d'adapter et de développer votre travail à des fins non commerciales, à condition qu'ils vous créditent et accordent une licence pour leurs nouvelles créations selon les mêmes conditions.",
    },
    attributionNonCommercial: {
      label: "Attribution – Non commercial",
      description:
        "Cette licence permet à d'autres de remixer, d'adapter et de développer votre travail de manière non commerciale, et bien que leurs nouvelles œuvres doivent également vous reconnaître et être non commerciales, ils ne sont pas obligés de concéder sous licence leurs œuvres dérivées dans les mêmes conditions.",
    },
    attributionNoDerivs: {
      label: "Attribution-Pas de dérivé",
      description:
        "Cette licence permet à d'autres de réutiliser l'œuvre à n'importe quelle fin, y compris commercialement ; cependant, il ne peut être partagé avec d’autres sous une forme adaptée et un crédit doit vous être accordé.",
    },
    attributionShareAlike: {
      label: "Attribution-Partage dans les mêmes conditions",
      description:
        "Cette licence permet à d'autres de remixer, d'adapter et de développer votre travail, même à des fins commerciales, à condition qu'ils vous créditent et accordent une licence pour leurs nouvelles créations selon les mêmes conditions. Cette licence est souvent comparée aux licences de logiciels libres et open source « copyleft ». Toutes les nouvelles œuvres basées sur la vôtre porteront la même licence, de sorte que tout dérivé permettra également une utilisation commerciale. Il s'agit de la licence utilisée par Wikipédia et elle est recommandée pour les documents qui bénéficieraient de l'incorporation de contenu de Wikipédia et de projets sous licence similaire.",
    },
    attribution: {
      label: "Attribution",
      description:
        "Cette licence permet à d'autres de distribuer, remixer, adapter et développer votre travail, même commercialement, à condition qu'ils vous créditent pour la création originale. Il s’agit de la licence la plus accommodante proposée. Recommandé pour une diffusion et une utilisation maximales de matériels sous licence.",
    },
    publicDomain: {
      label: "Domaine public",
      description:
        "La personne qui a associé une œuvre à cet acte a consacré l'œuvre au domaine public en renonçant à tous ses droits sur l'œuvre dans le monde entier au titre du droit d'auteur, y compris tous les droits voisins et voisins, dans la mesure permise par la loi.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Paysage",
    wide: "12 × 6 · Large",
    square: "12 × 12 · Carré",
    portrait: "8 × 12 · Portraits",
  },
} as const;
