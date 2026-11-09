/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "空画布",
      summary: "从图像布局或空白画布开始",
    },
    internalCanvas: {
      label: "现有画布",
      summary: "从此清单中选择一个画布。",
    },
    example: {
      label: "空白画布示例",
      summary: "创建一个带有标题的大空白画布。",
    },
    thumbnail: {
      label: "IIIF 缩略图",
      summary: "从 IIIF 影像服务创建缩略图。",
    },
    vtt: {
      label: "WebVTT 字幕",
      summary: "将 WebVTT 文件中的字幕添加到音频或视频画布。",
    },
    contents: {
      label: "目录",
      summary: "创建一个顶级范围来组织清单的内容。",
    },
    provider: {
      summary: "添加负责提供此资源的组织。",
    },
    browser: {
      label: "浏览IIIF内容",
      summary: "浏览 IIIF 清单、集合或支持的集合网页并选择要添加的内容。",
      copyMetadata: "将清单元数据添加到导入的画布中",
      copyMetadataHelp: "当IIIF Browser创建Canvas时，从源Manifest复制元数据。",
    },
    manifestBrowser: {
      summary: "浏览 IIIF 清单和集合以选择要添加的资源。",
    },
    audio: {
      label: "声音的",
      summary: "从直接音频文件链接添加音频。",
    },
    service: {
      label: "IIIF图片",
      summary: "使用 IIIF 图像服务或 info.json 链接添加可缩放图像。",
    },
    highlight: {
      label: "强调",
      summary: "标记画布区域而不添加任何内容。",
      create: "创造亮点",
    },
    annotationPage: {
      label: "空注释页",
      summary: "创建一个空页面来组织注释。",
    },
    range: {
      summary: "将画布或其他范围分组到一个部分中。",
    },
    imageList: {
      label: "多张图像",
      summary: "每行使用一个直接图像链接添加多个图像。",
    },
    plaintext: {
      label: "纯文本链接",
      summary: "链接到外部纯文本文件。",
    },
    htmlBody: {
      label: "格式化文本",
      summary: "将格式化文本写入作为注释的内容。",
    },
    html: {
      label: "HTML",
      summary: "编写格式化文本以显示在画布上。",
    },
    video: {
      label: "视频",
      summary: "从直接视频文件链接添加视频。对 YouTube 视频使用 YouTube。",
    },
    imageUrl: {
      label: "图像",
      summary: "使用直接图像文件链接添加图像。",
    },
    captionedImage: {
      label: "带标题的图片",
      summary: "从直接链接添加图像并编写其标题。",
    },
    youtube: {
      label: "YouTube",
      summary: "使用 YouTube 链接嵌入视频。",
    },
    webpage: {
      label: "网页",
      summary: "链接到外部网页。",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} 像素",
    audioUrl: "音频文件链接",
    addAudio: "添加音频",
    videoUrl: "视频文件链接",
    addVideo: "添加视频",
    serviceUrl: "图像服务链接",
    invalidService: "无效服务",
    imageUrl: "链接到图像",
    caption: "标题",
    describeImage: "描述图像",
    textUrl: "链接到纯文本文件",
    youtubeUrl: "链接至 YouTube",
    link: "关联",
    createLink: "创建链接",
    createRange: "创建范围",
    addThumbnail: "添加缩略图",
    selectSize: "选择尺码",
    urlList: "输入 URL 列表（每行一个）",
    homepageLabel: "主页标签",
    providerId: "提供商 ID",
    providerIdHelp: "如果不指定将会生成，这不是用户可以关注的URL",
    addProvider: "添加提供商",
    vttHelp: "将现有的 WebVTT (.vtt) 文件链接到此画布。添加文件之前，将文件托管在公共 URL 上。",
    vttUrl: "WebVTT 文件 URL",
    absoluteUrl: "输入绝对http://或https:// URL",
    languageCode: "语言（BCP 47代码）",
    languageCodeHelp: "语言代码，例如 en、fr 或 pt-BR",
    addCaptions: "添加字幕",
  },
  browser: {
    selectCanvas: "选择画布",
    select: "选择",
    addToManifest: "添加到清单",
  },
  errors: {
    media: "无法加载该媒体。检查链接并重试。",
    details: "技术细节",
    service: "无法加载图像服务。检查链接并重试。",
    vttUrl: "为 WebVTT 文件输入绝对值 HTTP 或 HTTPS URL。",
    vttCanvas: "WebVTT 字幕必须属于 Canvas。",
    manifest: "无法加载选定的清单。",
    collection: "无法加载所选集合。",
    canvas: "无法加载选定的画布。",
  },
  resource: {
    create: "创建资源",
    chooseType: "选择资源类型",
    label: "标签",
    url: "URL",
    invalidUrl: "输入有效的 URL",
    createFailed: "无法创建该资源",
  },
  canvas: {
    create: "创建画布",
    width: "宽度",
    height: "高度",
    duration: "期间",
  },
  image: {
    fromUrl: "图片 URL",
    fromService: "IIIF影像服务",
    browse: "浏览图片",
    previewAlt: "所选资源的预览",
    use: "使用图像",
  },
  content: {
    webPage: "网页",
    manifest: "清单",
    collection: "收藏",
  },
} as const;
