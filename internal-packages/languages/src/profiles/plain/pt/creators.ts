/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Página vazia",
      summary: "Comece com um layout de imagem ou uma página em branco",
    },
    internalCanvas: {
      label: "Página existente",
      summary: "Escolha uma página deste item.",
    },
    example: {
      label: "Exemplo de página em branco",
      summary: "Crie uma grande página em branco com um título.",
    },
    contents: {
      summary: "Crie uma seção para organizar o conteúdo deste item.",
    },
    range: {
      summary: "Agrupe páginas ou outras seções em uma seção.",
    },
    highlight: {
      summary: "Marque uma área da página sem adicionar conteúdo.",
    },
    html: {
      summary: "Escreva texto formatado para exibir em uma página.",
    },
    browser: {
      summary:
        "Navegue por um item, coleção ou página da Web de coleção compatível IIIF e escolha o conteúdo a ser adicionado.",
      copyMetadata: "Copiar detalhes do item para páginas importadas",
      copyMetadataHelp: "Copia detalhes descritivos do item de origem quando o navegador cria uma página.",
    },
    manifestBrowser: {
      summary: "Navegue pelos itens e coleções IIIF para escolher algo para adicionar.",
    },
    vtt: {
      summary: "Adicione legendas ou legendas ocultas de um arquivo WebVTT a uma página de áudio ou vídeo.",
    },
  },
  browser: {
    selectCanvas: "Selecione a página",
    addToManifest: "Adicionar ao item",
  },
  errors: {
    vttCanvas: "As legendas WebVTT devem pertencer a uma página.",
    canvas: "Não foi possível carregar a página selecionada.",
    manifest: "Não foi possível carregar o item selecionado.",
  },
  form: {
    vttHelp:
      "Vincule um arquivo WebVTT (.vtt) existente a esta página. Hospede o arquivo em um URL público antes de adicioná-lo.",
    createRange: "Criar seção",
  },
  resource: {
    create: "Adicione algo",
    chooseType: "Escolha o que adicionar",
  },
  canvas: {
    create: "Adicionar página",
  },
} as const;
