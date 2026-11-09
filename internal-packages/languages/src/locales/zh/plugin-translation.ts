/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  metadata: {
    label: "翻译",
    description: "翻译 IIIF 文本并管理语言标签。",
  },
  settings: {
    sourceLanguage: "源语言",
    targetLanguage: "目标语言",
    runtime: "运行时",
  },
  actions: {
    translate: "翻译",
    apply: "应用翻译",
    cancel: "取消翻译",
  },
  progress: {
    translated_other: "翻译了 {{count}} 个字段",
  },
  results: {
    empty: "没有翻译",
    existing: "现存的",
    suggested: "建议",
  },
} as const;
