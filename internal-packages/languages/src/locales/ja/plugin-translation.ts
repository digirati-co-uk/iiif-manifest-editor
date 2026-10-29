/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  metadata: {
    label: "翻訳",
    description: "IIIF テキスト コンテンツを翻訳し、言語タグを管理します。",
  },
  settings: {
    sourceLanguage: "ソース言語",
    targetLanguage: "対象言語",
    runtime: "ランタイム",
  },
  actions: {
    translate: "翻訳する",
    apply: "翻訳を適用する",
    cancel: "翻訳をキャンセルする",
  },
  progress: {
    translated_other: "{{count}} つのフィールドが翻訳されました",
  },
  results: {
    empty: "翻訳なし",
    existing: "既存",
    suggested: "提案された",
  },
} as const;
