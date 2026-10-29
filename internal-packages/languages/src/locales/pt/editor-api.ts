/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Coleção",
    manifest: "Manifesto",
    canvas: "Tela",
    annotation: "Anotação",
    annotationPage: "Página de anotação",
    range: "Intervalo",
    annotationCollection: "Coleção de anotações",
    contentResource: "Recurso de conteúdo",
    agent: "Agente",
  },
  layout: {
    pair: "Lado a lado",
    triptych: "Três colunas",
    featureLeft: "Recurso restante",
    featureAbove: "Recurso acima",
    fourImages: "Quatro imagens",
    sixImages: "Seis imagens",
    heroInset: "Herói + inserção",
    offsetPair: "Par de deslocamento",
    cascade: "Cascata",
    stacked: "Empilhado",
    scatter: "Dispersão",
    galleryWall: "Parede da galeria",
    blank: "Tela em branco",
  },
  fields: {
    label: "Rótulo",
    metadata: "Metadados",
    summary: "Resumo",
    requiredStatement: "Declaração obrigatória",
    rights: "Direitos",
    provider: "Provedor",
    thumbnail: "Miniatura",
    navDate: "Data de navegação",
    placeholderCanvas: "Tela de espaço reservado",
    accompanyingCanvas: "Acompanha tela",
    language: "Linguagem",
    id: "Identificador",
    type: "Tipo",
    format: "Formatar",
    profile: "Perfil",
    height: "Altura",
    width: "Largura",
    duration: "Duração",
    viewingDirection: "Direção de visualização",
    behavior: "Comportamento",
    timeMode: "Modo hora",
    motivation: "Motivação",
    homepage: "Página inicial",
    logo: "Logotipo",
    rendering: "Representação alternativa",
    service: "Serviço",
    services: "Serviços",
    seeAlso: "Descrição relacionada",
    partOf: "Parte de",
    start: "Tela inicial",
    supplementary: "Conteúdo complementar",
    items: "Unid",
    structures: "Estruturas",
    annotations: "Anotações",
    target: "Alvo",
    body: "Corpo",
    navPlace: "Localização de navegação",
    textGranularity: "Granularidade do texto",
    value: "Valor",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Uma lista ordenada de Manifestos e/ou Coleções adicionais. As Coleções permitem que Manifestos e Coleções filhas sejam agrupados em uma estrutura hierárquica para apresentação, que pode ser para gerar navegação, mostrar resultados dinâmicos de uma pesquisa ou fornecer conjuntos fixos de recursos relacionados para qualquer outra finalidade.",
      Manifest:
        "Uma descrição da estrutura e das propriedades do objeto composto. Contém informações necessárias para que o cliente apresente o conteúdo ao usuário, como título e outras informações descritivas sobre o objeto ou a obra intelectual que ele veicula. Cada Manifesto geralmente descreve como apresentar um único objeto composto, como um livro, uma estátua ou um álbum de música.",
      Canvas:
        "Um contêiner virtual que representa uma visualização específica do objeto e possui recursos de conteúdo associados a ele ou a partes dele. O Canvas fornece um quadro de referência para o layout do conteúdo, tanto espacial quanto temporalmente. O conceito de Canvas é emprestado de padrões como PDF e HTML, ou de aplicativos como Photoshop e PowerPoint, onde uma superfície de exibição inicialmente em branco tem imagens, vídeo, texto e outros conteúdos “pintados” nela por Anotações, coletadas em Páginas de Anotação.",
      Range:
        "Uma lista ordenada de telas e/ou intervalos adicionais. Os intervalos permitem que as telas, ou partes delas, sejam agrupadas de alguma forma. Isso pode ocorrer por motivos baseados no conteúdo, como os que podem ser descritos em um índice ou no conjunto de cenas de uma peça. Da mesma forma, características físicas podem ser importantes, como agrupamentos de páginas em um livro antigo ou quando a música gravada é dividida em diferentes suportes físicos, como dois CDs.",
      AnnotationPage:
        "Uma lista ordenada de anotações que normalmente está associada a um Canvas, mas também pode ser referenciada por outros tipos de recursos. As páginas de anotação coletam e ordenam listas de anotações, que por sua vez fornecem comentários sobre um recurso ou conteúdo que faz parte de um Canvas.",
      Annotation:
        "As anotações associam recursos de conteúdo ao Canvas. O mesmo mecanismo é usado para os recursos visíveis e/ou audíveis usado para transcrições, comentários, tags e outros conteúdos. Isso fornece um método único e unificado para alinhar informações e fornece uma estrutura baseada em padrões para distinguir partes de recursos e partes de Canvases. Como as anotações podem ser adicionadas posteriormente, promove um sistema distribuído no qual os editores podem alinhar seu conteúdo com as descrições criadas por outros. A funcionalidade relacionada à anotação também pode depender de outras classes, como SpecificResource, Choice ou Seletores.",
      ContentResource:
        "Recursos da Web, como imagens, áudio, vídeo ou texto, associados a um Canvas por meio de uma anotação ou que fornecem uma representação de qualquer recurso.",
      AnnotationCollection:
        "Uma lista ordenada de páginas de anotação. As Coleções de Anotações permitem que agrupamentos de Anotações de nível superior sejam registrados. Por exemplo, todas as anotações de tradução para o inglês de um documento medieval francês podem ser mantidas separadas da transcrição ou de uma edição em francês moderno, ou o comentário do diretor sobre um filme pode ser separado do roteiro.",
    },
    descriptive: {
      label:
        "Um rótulo, nome ou título legível por humanos. A propriedade label destina-se a ser exibida como um substituto textual curto para o recurso se um ser humano precisar fazer uma distinção entre ele e recursos semelhantes, por exemplo, entre objetos, páginas ou opções para uma escolha de imagens a serem exibidas. A propriedade label pode ser totalmente internacionalizada e cada idioma pode ter vários valores.",
      metadata:
        "Uma lista ordenada de descrições a serem exibidas ao usuário quando ele interage com o recurso, fornecidas como pares de entradas de rótulo e valor legíveis por humanos. O conteúdo destas entradas destina-se apenas a apresentação; a semântica descritiva não deve ser inferida. Uma entrada pode ser usada para transmitir informações sobre a criação do objeto, uma descrição física, informações de propriedade ou outros propósitos.",
      summary:
        "Um breve resumo textual destinado a ser transmitido ao usuário quando as entradas de metadados do recurso não estiverem sendo exibidas. Isso pode ser usado como uma breve descrição para resultados de pesquisa em nível de item, para ambientes de tela pequena ou como uma interface de usuário alternativa quando a propriedade de metadados não estiver sendo renderizada no momento. A propriedade summary segue o mesmo padrão da propriedade label descrita acima.",
      requiredStatement:
        "Texto que deve ser exibido quando o recurso for exibido ou usado. Por exemplo, a propriedade requiredStatement pode ser usada para apresentar declarações de direitos autorais ou de propriedade, um reconhecimento da instituição proprietária e/ou editora, ou qualquer outro texto que a organização editora considere crítico para exibir ao usuário. Dada a grande variação de possíveis interfaces de usuário do cliente, nem sempre será possível exibir esta instrução ao usuário no estado inicial do cliente. Se inicialmente oculto, os clientes devem tornar o método de revelá-lo o mais óbvio possível.",
      rights:
        "Uma string que identifica uma declaração de licença ou direitos que se aplica ao conteúdo do recurso, como o JSON de um Manifesto ou os pixels de uma imagem. O valor deve ser extraído do conjunto de URIs de licença Creative Commons, dos URIs de declaração de direitos RightsStatements.org ou daqueles adicionados por meio do mecanismo de extensão. A inclusão desta propriedade é informativa e, por exemplo, poderia ser usada para exibir um ícone representando as declarações de direitos.",
      provider:
        "Uma organização ou pessoa que contribuiu para fornecer o conteúdo do recurso. Os clientes podem então exibir essas informações ao usuário para reconhecer as contribuições do provedor. Isso difere da propriedade requiredStatement, pois os dados são estruturados, permitindo ao cliente fazer mais do que apenas apresentar texto, mas ter informações mais ricas sobre as pessoas e organizações para utilizar em diferentes interfaces.",
      thumbnail:
        "Um recurso de conteúdo, como uma imagem pequena ou um clipe de áudio curto, que representa o recurso que possui a propriedade miniatura. Um recurso pode ter vários recursos de miniaturas com tipo e formato iguais ou diferentes.",
      navDate:
        "Uma data que os clientes podem usar para fins de navegação ao apresentar o recurso ao usuário em uma interface de usuário baseada em data, como um calendário ou uma linha do tempo. Intervalos de datas mais descritivos, destinados à exibição direta ao usuário, devem ser incluídos na propriedade de metadados para consumo humano. Se o recurso contiver Telas que possuem a propriedade Duração, a data e hora fornecida corresponderá à data e hora da navegação do início do recurso. Por exemplo, um Range que inclui um Canvas que representa um conjunto de conteúdo de vídeo gravando um evento histórico, o navDate é a data e hora do primeiro momento do evento gravado.",
      placeholderCanvas:
        "Um único Canvas que fornece conteúdo adicional para uso antes que o conteúdo principal do recurso que possui a propriedade placeholderCanvas seja renderizado, ou como um anúncio ou substituto para esse conteúdo. Os exemplos incluem imagens, texto e som que substituem o conteúdo de vídeo antes que o usuário inicie a reprodução; ou um pôster de filme para atrair a atenção do usuário. O conteúdo fornecido pelo placeholderCanvas difere de uma miniatura: um cliente pode usar a miniatura para resumir e navegar em vários recursos e, em seguida, mostrar o conteúdo do placeholderCanvas como parte da apresentação inicial de um único recurso. É provável que um espaço reservado Canvas tenha dimensões diferentes daquelas das Canvas do recurso que possui a propriedade placeholderCanvas.",
      accompanyingCanvas:
        "Um único Canvas que fornece conteúdo adicional para uso ao renderizar o recurso que possui a propriedade accompanyingCanvas. Os exemplos incluem uma imagem para mostrar enquanto um Canvas apenas com duração está reproduzindo áudio; ou áudio de fundo para ser reproduzido enquanto um usuário navega em um manifesto somente de imagem.",
      language:
        "O idioma ou idiomas usados ​​no conteúdo deste recurso externo. Esta propriedade já está disponível no modelo Web Annotation para recursos de conteúdo que são o corpo ou destino de uma Anotação, porém também pode ser usada para recursos referenciados na página inicial, renderização e partOf.",
    },
    technical: {
      id: "O URI que identifica o recurso. Se o recurso estiver disponível apenas incorporado em outro recurso, como um intervalo em um manifesto, o URI poderá ser o URI do recurso incorporado com um fragmento exclusivo no final. Isso não é verdade para Canvases, que devem ter seu próprio URI sem fragmento.",
      type: "O tipo ou classe do recurso. Para classes definidas para esta especificação",
      format:
        "O tipo de mídia específico (geralmente chamado de tipo MIME) para um recurso de conteúdo, por exemplo image/jpeg. Isto é importante para distinguir diferentes formatos do mesmo tipo geral de recurso, como distinguir texto em XML de texto simples.",
      profile:
        "Um esquema ou conjunto nomeado de funcionalidades disponíveis no recurso. O perfil pode esclarecer ainda mais o tipo e/ou formato de um recurso ou serviço externo, permitindo que os clientes personalizem o tratamento do recurso que possui a propriedade profile.",
      height:
        "A altura do Canvas ou do recurso de conteúdo externo. Para recursos de conteúdo, o valor está em pixels. Para Canvases, o valor não possui unidade. Em combinação com a largura, transmite uma proporção do espaço no qual os recursos de conteúdo estão localizados.",
      width:
        "A largura do Canvas ou do recurso de conteúdo externo. Para recursos de conteúdo, o valor está em pixels. Para Canvases, o valor não possui unidade. Em combinação com a altura, transmite uma proporção do espaço onde os recursos de conteúdo estão localizados.",
      duration: "A duração do Canvas ou do recurso de conteúdo externo, fornecida em segundos.",
      viewingDirection:
        "A direção na qual um conjunto de Canvas deve ser exibido ao usuário. Esta especificação define quatro valores de direção na tabela abaixo. Outros podem ser definidos externamente como uma extensão.",
      behavior:
        "Um conjunto de recursos de experiência do usuário que o editor do conteúdo preferiria que o cliente usasse ao apresentar o recurso. Esta especificação define os valores na tabela abaixo. Outros podem ser definidos externamente como uma extensão.",
      timeMode:
        "Um modo associado a uma anotação que deve ser aplicado à renderização de qualquer mídia baseada em tempo, ou que de outra forma pode ser considerado como tendo uma duração, usado como um recurso corporal dessa anotação. Observe que a associação de timeMode com a Anotação significa que diferentes recursos no corpo não podem ter valores diferentes. Esta especificação define os valores especificados na tabela abaixo. Outros podem ser definidos externamente como uma extensão.",
      motivation:
        "Esta especificação define dois valores para a propriedade Web Annotation de motivação ou propósito quando usada em um Recurso Específico ou Textual Body. Os recursos associados a um Canvas por uma Anotação que possui o valor de motivação “painting” devem ser apresentados ao usuário como a representação do Canvas. Os recursos associados a um Canvas por uma anotação que possui o valor de motivação supplementing podem ser apresentados ao usuário como parte da representação do Canvas ou podem ser apresentados em uma parte diferente da interface do usuário.",
    },
    linking: {
      homepage:
        "Uma página da web que trata do objeto representado pelo recurso que possui a propriedade homepage. A página web geralmente é publicada pela organização responsável pelo objeto e pode ser gerada por um sistema de gerenciamento de conteúdo ou outro sistema de catalogação. O recurso deve poder ser exibido diretamente ao usuário. Os recursos relacionados, mas não as páginas iniciais, devem ser adicionados à propriedade de metadados, com um rótulo ou valor apropriado para descrever o relacionamento.",
      logo: "Um pequeno recurso de imagem que representa o recurso Agente ao qual está associado. O logotipo deve ser claramente renderizado quando o recurso for exibido ou utilizado, sem cortar, girar ou distorcer a imagem. Recomenda-se que um serviço API de imagem IIIF esteja disponível para esta imagem para outras manipulações, como redimensionamento.",
      rendering:
        "Um recurso que é uma representação alternativa, não IIIF, do recurso que possui a propriedade de renderização. Essas representações normalmente não podem ser pintadas em um único Canvas, pois incluem muitas visualizações, têm dimensões incompatíveis ou são recursos compostos que exigem funcionalidade de renderização adicional. O recurso de renderização deve poder ser exibido diretamente para um usuário humano, embora a apresentação possa estar fora do cliente IIIF. O recurso não deve ter uma página inicial ou outro recurso intersticial que medeie o acesso a ele. Se o controle de acesso for necessário, a API de autenticação IIIF é recomendada. Os exemplos incluem a renderização de um livro como PDF ou EPUB, uma apresentação de slides com imagens de um edifício ou um modelo 3D de uma estátua.",
      service:
        "Um serviço com o qual o cliente pode interagir diretamente e obter informações ou funcionalidades adicionais para usar o recurso que possui a propriedade de serviço, como de uma imagem para o URI base de um serviço de API de imagem IIIF associado. O recurso de serviço deve ter informações adicionais associadas a ele para permitir que o cliente determine como fazer uso adequado dele. Consulte o documento Registro de Serviços para obter detalhes dos tipos de serviços atualmente conhecidos.",
      services:
        "Uma lista de uma ou mais definições de serviço no recurso superior do documento, que normalmente são compartilhadas por mais de um recurso subsequente. Isso permite que esses serviços compartilhados sejam coletados juntos em um único local, em vez de ter suas informações duplicadas potencialmente muitas vezes ao longo do documento ou exigir que um cliente consumidor percorra toda a estrutura do documento para encontrar as informações. O recurso ao qual o serviço se aplica ainda deve ter a propriedade service, conforme descrito acima, onde os recursos de serviço possuem pelo menos as propriedades id e type ou @id e @type. Isso permite que o cliente saiba que o serviço se aplica a esse recurso. O uso da propriedade de serviços fica a critério do sistema de publicação.",
      seeAlso:
        "Um recurso legível por máquina, como uma descrição XML ou RDF, relacionado ao recurso atual que possui a propriedade seeAlso. As propriedades do recurso devem ser fornecidas para ajudar o cliente a selecionar entre múltiplas descrições (se fornecidas) e a fazer uso adequado do documento. Se o relacionamento entre o recurso e o documento precisar ser mais específico, o documento deverá incluir esse relacionamento em vez do recurso IIIF. Outros recursos IIIF também são alvos válidos para seeAlso, por exemplo, para vincular a um Manifesto que descreve um objeto relacionado. O URI do documento deve identificar uma única representação dos dados em um formato específico. Por exemplo, se os mesmos dados existirem em JSON e XML, então recursos separados deverão ser adicionados para cada representação, com propriedades de id e formato distintas.",
      partOf:
        "Um recurso contendo que inclui o recurso que possui a propriedade partOf. Quando um cliente encontra a propriedade partOf, ele pode recuperar o recurso contido referenciado, se não estiver incorporado na representação atual, a fim de contribuir para o processamento do recurso contido. Por exemplo, a propriedade partOf em um Canvas pode ser usada para fazer referência a um manifesto externo para permitir a descoberta de mais informações relevantes. Da mesma forma, um Manifesto pode fazer referência a uma coleção contendo usando partOf para auxiliar na navegação.",
      start:
        "Um Canvas, ou parte de um Canvas, que o cliente deve mostrar na inicialização do recurso que possui a propriedade start. A referência a parte de um Canvas é tratada da mesma maneira que Ranges faz referência a partes de Canvases. Esta propriedade permite que o cliente comece com o primeiro Canvas que contém conteúdo interessante, em vez de exigir que o usuário navegue manualmente para encontrá-lo.",
      supplementary:
        "Um link deste intervalo para uma coleção de anotações que inclui as anotações supplementing de recursos de conteúdo para o intervalo. Os clientes podem usar isso para apresentar conteúdo adicional ao usuário de um Canvas diferente ao interagir com o Range, ou para pular para a próxima parte do Range dentro do mesmo Canvas. Por exemplo, o Range pode representar um artigo de jornal que abrange páginas não sequenciais e, em seguida, usa a propriedade suplementar para fazer referência a uma Coleção de Anotações que consiste nas Anotações que registram o texto, divididas em Páginas de Anotações por página de jornal. Alternativamente, a Faixa pode representar as partes de um manuscrito que foram transcritas ou traduzidas, quando há outras partes que ainda precisam ser trabalhadas. A Coleção de Anotações seriam as Anotações que transcrevem ou traduzem, respectivamente.",
    },
    structural: {
      items:
        "Grande parte da funcionalidade da API de apresentação IIIF consiste simplesmente em registrar a ordem em que os recursos filhos ocorrem em um recurso pai, como coleções ou manifestos em uma coleção pai ou telas em um manifesto. Todas essas situações são cobertas por uma única propriedade, os itens.",
      structures:
        "A estrutura de um objeto representado como Manifesto pode ser descrita usando uma hierarquia de Ranges. Os intervalos podem ser usados ​​para descrever o “índice” do objeto ou outras estruturas com as quais o usuário possa interagir além da ordem dada pela propriedade items do Manifesto. A hierarquia é construída aninhando os recursos Range filho na matriz de itens do Range de nível superior. Os intervalos de nível superior dessas hierarquias são fornecidos na propriedade de estruturas.",
      annotations:
        "Uma lista ordenada de páginas de anotações que contêm comentários ou outras anotações sobre este recurso, separadas das anotações usadas para pintar conteúdo em uma tela. A motivação das Anotações não deve ser painting, e o alvo das Anotações deve incluir este recurso ou parte dele.",
    },
    attribution:
      "Copyright © 2012-2023 Editores e colaboradores. Publicado pelo Consórcio IIIF sob a licença CC-BY, consulte o aviso legal.",
  },
  behavior: {
    groups: {
      autoAdvance: "Avanço automático",
      repeat: "Repita",
      manifestOrdering: "Ordenação de manifesto",
      canvasOrdering: "Pedido de tela",
      collection: "Coleção",
      range: "Intervalo",
      collectionOrdering: "Ordenação de coleção",
      rangeOrdering: "Ordenação de intervalo",
      hidden: "Visibilidade",
    },
    values: {
      "auto-advance": "Avanço automático",
      "no-auto-advance": "Sem avanço automático",
      repeat: "Repita",
      "no-repeat": "Sem repetição",
      unordered: "Não ordenado",
      individuals: "Telas individuais",
      continuous: "Contínuo",
      paged: "Paginado",
      "facing-pages": "Páginas opostas",
      "non-paged": "Não paginado",
      "multi-part": "Várias partes",
      together: "Junto",
      sequence: "Sequência",
      "thumbnail-nav": "Navegação em miniatura",
      "no-nav": "Sem navegação",
      hidden: "Escondido",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Atribuição-NãoComercial-SemDerivações",
      description:
        "Esta licença é a mais restritiva das nossas seis licenças principais, permitindo apenas que outros baixem seus trabalhos e os compartilhem com outras pessoas, desde que atribuam crédito a você, mas não podem alterá-los de forma alguma ou usá-los comercialmente.",
    },
    attributionNonCommercialShareAlike: {
      label: "Atribuição-NãoComercial-Compartilhamento pela mesma Licença",
      description:
        "Esta licença permite que outros remixem, adaptem e desenvolvam seu trabalho de forma não comercial, desde que atribuam crédito a você e licenciem suas novas criações sob termos idênticos.",
    },
    attributionNonCommercial: {
      label: "Atribuição não comercial",
      description:
        "Esta licença permite que outros remixem, adaptem e desenvolvam seu trabalho de forma não comercial e, embora seus novos trabalhos também devam reconhecê-lo e ser não comerciais, eles não precisam licenciar seus trabalhos derivados nos mesmos termos.",
    },
    attributionNoDerivs: {
      label: "Atribuição-Sem Derivações",
      description:
        "Esta licença permite que terceiros reutilizem a obra para qualquer finalidade, inclusive comercial; no entanto, ele não pode ser compartilhado com outras pessoas de forma adaptada e o crédito deve ser fornecido a você.",
    },
    attributionShareAlike: {
      label: "Atribuição-Compartilhamento pela mesma",
      description:
        "Esta licença permite que outros remixem, adaptem e desenvolvam seu trabalho, mesmo para fins comerciais, desde que atribuam crédito a você e licenciem suas novas criações sob termos idênticos. Esta licença é frequentemente comparada a licenças de software livre e de código aberto “copyleft”. Todos os novos trabalhos baseados nos seus terão a mesma licença, portanto quaisquer derivados também permitirão o uso comercial. Esta é a licença usada pela Wikipédia e é recomendada para materiais que se beneficiariam da incorporação de conteúdo da Wikipédia e de projetos licenciados de forma semelhante.",
    },
    attribution: {
      label: "Atribuição",
      description:
        "Esta licença permite que outros distribuam, remixem, adaptem e desenvolvam seu trabalho, até mesmo comercialmente, desde que atribuam a você o crédito pela criação original. Esta é a licença mais flexível oferecida. Recomendado para máxima divulgação e utilização de materiais licenciados.",
    },
    publicDomain: {
      label: "Domínio público",
      description:
        "A pessoa que associou uma obra a esta escritura dedicou a obra ao domínio público, renunciando a todos os seus direitos sobre a obra em todo o mundo ao abrigo da lei de direitos de autor, incluindo todos os direitos conexos e conexos, na medida permitida por lei.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Paisagem",
    wide: "12 × 6 · Largo",
    square: "12 × 12 · Quadrado",
    portrait: "8 × 12 · Retrato",
  },
} as const;
