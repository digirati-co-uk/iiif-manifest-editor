/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "空のページ",
      summary: "画像レイアウトまたは空白のページから始めます",
    },
    internalCanvas: {
      label: "既存のページ",
      summary: "この項目からページを選択してください。",
    },
    example: {
      label: "空白ページの例",
      summary: "タイトルを付けた大きな空白のページを作成します。",
    },
    contents: {
      summary: "この項目の内容を整理するセクションを作成します。",
    },
    range: {
      summary: "ページまたは他のセクションをセクションにグループ化します。",
    },
    highlight: {
      summary: "コンテンツを追加せずにページの領域をマークします。",
    },
    html: {
      summary: "ページに表示する書式設定されたテキストを記述します。",
    },
    browser: {
      summary:
        "IIIF アイテム、コレクション、またはサポートされているコレクションの Web ページを参照し、追加するコンテンツを選択します。",
      copyMetadata: "アイテムの詳細をインポートされたページにコピーする",
      copyMetadataHelp: "ブラウザーがページを作成するときに、ソース アイテムから説明の詳細をコピーします。",
    },
    manifestBrowser: {
      summary: "IIIF アイテムとコレクションを参照して、追加するものを選択します。",
    },
    vtt: {
      summary: "WebVTT ファイルの字幕またはキャプションをオーディオ ページまたはビデオ ページに追加します。",
    },
  },
  browser: {
    selectCanvas: "ページを選択",
    addToManifest: "アイテムに追加",
  },
  errors: {
    vttCanvas: "WebVTT キャプションはページに属している必要があります。",
    canvas: "選択したページを読み込めませんでした。",
    manifest: "選択した項目を読み込めませんでした。",
  },
  form: {
    vttHelp:
      "既存の WebVTT (.vtt) ファイルをこのページにリンクします。ファイルを追加する前に、パブリック URL でファイルをホストします。",
    createRange: "セクションの作成",
  },
  resource: {
    create: "何かを追加",
    chooseType: "追加するものを選択してください",
  },
  canvas: {
    create: "ページを追加",
  },
} as const;
