/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Tela vazia",
      summary: "Comece com um layout de imagem ou uma tela em branco",
    },
    internalCanvas: {
      label: "Tela existente",
      summary: "Escolha uma tela deste manifesto.",
    },
    example: {
      label: "Exemplo de tela em branco",
      summary: "Crie uma grande tela em branco com um título.",
    },
    thumbnail: {
      label: "Miniatura IIIF",
      summary: "Crie uma miniatura de um serviço de imagem IIIF.",
    },
    vtt: {
      label: "Legendas WebVTT",
      summary: "Adicione legendas ou legendas ocultas de um arquivo WebVTT a uma tela de áudio ou vídeo.",
    },
    contents: {
      label: "Índice",
      summary: "Crie um intervalo de nível superior para organizar o conteúdo do manifesto.",
    },
    provider: {
      summary: "Adicione a organização responsável por fornecer este recurso.",
    },
    browser: {
      label: "Navegue pelo conteúdo IIIF",
      summary:
        "Navegue por um manifesto IIIF, coleção ou página da web de coleção compatível e escolha o conteúdo a ser adicionado.",
      copyMetadata: "Adicione metadados de manifesto a telas importadas",
      copyMetadataHelp: "Copia metadados do manifesto de origem quando IIIF Browser cria um Canvas.",
    },
    manifestBrowser: {
      summary: "Navegue pelos manifestos e coleções IIIF para escolher um recurso para adicionar.",
    },
    audio: {
      label: "Áudio",
      summary: "Adicione áudio de um link direto de arquivo de áudio.",
    },
    service: {
      label: "imagem IIIF",
      summary: "Adicione uma imagem com zoom usando um serviço de imagem IIIF ou link info.json.",
    },
    highlight: {
      label: "Destaque",
      summary: "Marque uma região da tela sem adicionar nenhum conteúdo.",
      create: "Criar destaque",
    },
    annotationPage: {
      label: "Página de anotação vazia",
      summary: "Crie uma página vazia para organizar anotações.",
    },
    range: {
      summary: "Agrupe telas ou outros intervalos em uma seção.",
    },
    imageList: {
      label: "Várias imagens",
      summary: "Adicione várias imagens usando um link direto de imagem por linha.",
    },
    plaintext: {
      label: "Link de texto simples",
      summary: "Link para um arquivo de texto simples externo.",
    },
    htmlBody: {
      label: "Texto formatado",
      summary: "Escreva texto formatado como o conteúdo de uma anotação.",
    },
    html: {
      label: "HTML",
      summary: "Escreva texto formatado para exibir em uma tela.",
    },
    video: {
      label: "Vídeo",
      summary: "Adicione vídeo a partir de um link direto para arquivo de vídeo. Use YouTube para vídeos YouTube.",
    },
    imageUrl: {
      label: "Imagem",
      summary: "Adicione uma imagem usando um link direto de arquivo de imagem.",
    },
    captionedImage: {
      label: "Imagem legendada",
      summary: "Adicione uma imagem de um link direto e escreva sua legenda.",
    },
    youtube: {
      label: "YouTube",
      summary: "Incorpore um vídeo usando seu link YouTube.",
    },
    webpage: {
      label: "página da Internet",
      summary: "Link para uma página externa.",
    },
  },
  form: {
    dimensions: "Pixels {{width}} × {{height}}",
    audioUrl: "Link para arquivo de áudio",
    addAudio: "Adicionar áudio",
    videoUrl: "Link para arquivo de vídeo",
    addVideo: "Adicionar vídeo",
    serviceUrl: "Link para serviço de imagem",
    invalidService: "Serviço inválido",
    imageUrl: "Link para imagem",
    caption: "Rubrica",
    describeImage: "Descreva a imagem",
    textUrl: "Link para arquivo de texto simples",
    youtubeUrl: "Link para YouTube",
    link: "Link",
    createLink: "Criar link",
    createRange: "Criar intervalo",
    addThumbnail: "Adicionar miniatura",
    selectSize: "Selecione o tamanho",
    urlList: "Insira uma lista de URLs (um por linha)",
    homepageLabel: "Etiqueta da página inicial",
    providerId: "ID do provedor",
    providerIdHelp: "Será gerado se não for especificado, este não é um URL que o usuário possa seguir",
    addProvider: "Adicionar provedor",
    vttHelp:
      "Vincule um arquivo WebVTT (.vtt) existente a esta tela. Hospede o arquivo em um URL público antes de adicioná-lo.",
    vttUrl: "WebVTT arquivo URL",
    absoluteUrl: "Insira um http:// ou https:// absoluto URL",
    languageCode: "Idioma (código BCP 47)",
    languageCodeHelp: "Um código de idioma como en, fr ou pt-BR",
    addCaptions: "Adicionar legendas",
  },
  browser: {
    selectCanvas: "Selecione a tela",
    select: "Selecionar",
    addToManifest: "Adicionar ao manifesto",
  },
  errors: {
    media: "Não foi possível carregar esta mídia. Verifique o link e tente novamente.",
    details: "Detalhes técnicos",
    service: "Não foi possível carregar o serviço de imagem. Verifique o link e tente novamente.",
    vttUrl: "Insira um HTTP ou HTTPS URL absoluto para o arquivo WebVTT.",
    vttCanvas: "As legendas WebVTT devem pertencer a um Canvas.",
    manifest: "Não foi possível carregar o manifesto selecionado.",
    collection: "Não foi possível carregar a coleção selecionada.",
    canvas: "Não foi possível carregar a tela selecionada.",
  },
  resource: {
    create: "Criar recurso",
    chooseType: "Escolha um tipo de recurso",
    label: "Rótulo",
    url: "URL",
    invalidUrl: "Insira um URL válido",
    createFailed: "Não foi possível criar este recurso",
  },
  canvas: {
    create: "Criar tela",
    width: "Largura",
    height: "Altura",
    duration: "Duração",
  },
  image: {
    fromUrl: "Imagem URL",
    fromService: "Serviço de imagem IIIF",
    browse: "Navegar pelas imagens",
    previewAlt: "Pré-visualização do recurso selecionado",
    use: "Usar imagem",
  },
  content: {
    webPage: "página da Internet",
    manifest: "Manifesto",
    collection: "Coleção",
  },
} as const;
