/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "空白页",
      summary: "从图像布局或空白页面开始",
    },
    internalCanvas: {
      label: "现有页面",
      summary: "从此项目中选择一个页面。",
    },
    example: {
      label: "空白页示例",
      summary: "创建一个带有标题的大空白页。",
    },
    contents: {
      summary: "创建一个部分来组织该项目的内容。",
    },
    range: {
      summary: "将页面或其他部分分组为一个部分。",
    },
    highlight: {
      summary: "标记页面的某个区域而不添加内容。",
    },
    html: {
      summary: "编写要在页面上显示的格式化文本。",
    },
    browser: {
      summary: "浏览 IIIF 项目、集合或支持的集合网页并选择要添加的内容。",
      copyMetadata: "将项目详细信息复制到导入的页面",
      copyMetadataHelp: "当浏览器创建页面时，从源项目复制描述性详细信息。",
    },
    manifestBrowser: {
      summary: "浏览 IIIF 项目和收藏以选择要添加的内容。",
    },
    vtt: {
      summary: "将 WebVTT 文件中的字幕添加到音频或视频页面。",
    },
  },
  browser: {
    selectCanvas: "选择页面",
    addToManifest: "添加到项目",
  },
  errors: {
    vttCanvas: "WebVTT 标题必须属于一个页面。",
    canvas: "无法加载所选页面。",
    manifest: "无法加载所选项目。",
  },
  form: {
    vttHelp: "将现有的 WebVTT (.vtt) 文件链接到此页面。添加文件之前，将文件托管在公共 URL 上。",
    createRange: "创建部分",
  },
  resource: {
    create: "添加一些东西",
    chooseType: "选择要添加的内容",
  },
  canvas: {
    create: "添加页面",
  },
} as const;
