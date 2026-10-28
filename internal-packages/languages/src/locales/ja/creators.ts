/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "空のキャンバス",
      summary: "画像レイアウトまたは空白のキャンバスから始めます",
    },
    internalCanvas: {
      label: "既存のキャンバス",
      summary: "このマニフェストからキャンバスを選択します。",
    },
    example: {
      label: "空白のキャンバスの例",
      summary: "タイトルを付けた大きな空白のキャンバスを作成します。",
    },
    thumbnail: {
      label: "IIIF サムネイル",
      summary: "IIIF イメージ サービスからサムネイルを作成します。",
    },
    vtt: {
      label: "WebVTT キャプション",
      summary: "WebVTT ファイルからオーディオまたはビデオ キャンバスに字幕またはキャプションを追加します。",
    },
    contents: {
      label: "目次",
      summary: "最上位範囲を作成してマニフェストの内容を整理します。",
    },
    provider: {
      summary: "このリソースの提供を担当する組織を追加します。",
    },
    browser: {
      label: "IIIF コンテンツを閲覧する",
      summary:
        "IIIF マニフェスト、コレクション、またはサポートされているコレクション Web ページを参照し、追加するコンテンツを選択します。",
      copyMetadata: "インポートされたキャンバスにマニフェスト メタデータを追加する",
      copyMetadataHelp: "IIIF Browser がキャンバスを作成するときに、ソース マニフェストからメタデータをコピーします。",
    },
    manifestBrowser: {
      summary: "IIIF マニフェストとコレクションを参照して、追加するリソースを選択します。",
    },
    audio: {
      label: "オーディオ",
      summary: "音声ファイルの直接リンクから音声を追加します。",
    },
    service: {
      label: "IIIF画像",
      summary: "IIIF イメージ サービスまたは info.json リンクを使用して、ズーム可能な画像を追加します。",
    },
    highlight: {
      label: "ハイライト",
      summary: "コンテンツを追加せずに、キャンバスの領域をマークします。",
      create: "ハイライトの作成",
    },
    annotationPage: {
      label: "空の注釈ページ",
      summary: "注釈を整理するために空のページを作成します。",
    },
    range: {
      summary: "キャンバスまたはその他の範囲をセクションにグループ化します。",
    },
    imageList: {
      label: "複数の画像",
      summary: "1 行に 1 つの直接画像リンクを使用して、複数の画像を追加します。",
    },
    plaintext: {
      label: "プレーンテキストリンク",
      summary: "外部のプレーンテキスト ファイルへのリンク。",
    },
    htmlBody: {
      label: "書式設定されたテキスト",
      summary: "書式設定されたテキストを注釈のコンテンツとして書き込みます。",
    },
    html: {
      label: "HTML",
      summary: "キャンバスに表示する書式設定されたテキストを記述します。",
    },
    video: {
      label: "ビデオ",
      summary: "ビデオ ファイルの直接リンクからビデオを追加します。 YouTube ビデオには YouTube を使用します。",
    },
    imageUrl: {
      label: "画像",
      summary: "画像ファイルの直接リンクを使用して画像を追加します。",
    },
    captionedImage: {
      label: "キャプション付き画像",
      summary: "直接リンクから画像を追加し、そのキャプションを書き込みます。",
    },
    youtube: {
      label: "YouTube",
      summary: "YouTube リンクを使用してビデオを埋め込みます。",
    },
    webpage: {
      label: "ウェブページ",
      summary: "外部 Web ページへのリンク。",
    },
  },
  form: {
    dimensions: "{{width}} × {{height}} ピクセル",
    audioUrl: "音声ファイルへのリンク",
    addAudio: "音声を追加する",
    videoUrl: "動画ファイルへのリンク",
    addVideo: "ビデオを追加",
    serviceUrl: "画像サービスへのリンク",
    invalidService: "無効なサービス",
    imageUrl: "画像へのリンク",
    caption: "キャプション",
    describeImage: "画像の説明",
    textUrl: "プレーンテキストファイルへのリンク",
    youtubeUrl: "YouTubeへのリンク",
    link: "リンク",
    createLink: "リンクの作成",
    createRange: "範囲の作成",
    addThumbnail: "サムネイルを追加する",
    selectSize: "サイズを選択してください",
    urlList: "URL のリストを入力します (1 行に 1 つ)",
    homepageLabel: "ホームページラベル",
    providerId: "プロバイダーID",
    providerIdHelp: "指定しない場合は生成されます。これはユーザーがフォローできる URL ではありません",
    addProvider: "プロバイダーの追加",
    vttHelp:
      "既存の WebVTT (.vtt) ファイルをこのキャンバスにリンクします。ファイルを追加する前に、パブリック URL でファイルをホストします。",
    vttUrl: "WebVTT ファイル URL",
    absoluteUrl: "絶対的な http:// または https:// URL を入力してください",
    languageCode: "言語 (BCP 47 コード)",
    languageCodeHelp: "en、fr、pt-BR などの言語コード",
    addCaptions: "キャプションを追加する",
  },
  browser: {
    selectCanvas: "キャンバスを選択",
    select: "選択",
    addToManifest: "マニフェストに追加",
  },
  errors: {
    media: "このメディアをロードできませんでした。リンクを確認して、もう一度試してください。",
    details: "技術的な詳細",
    service: "イメージ サービスをロードできませんでした。リンクを確認して、もう一度試してください。",
    vttUrl: "WebVTT ファイルには絶対 HTTP または HTTPS URL を入力します。",
    vttCanvas: "WebVTT キャプションはキャンバスに属している必要があります。",
    manifest: "選択したマニフェストをロードできませんでした。",
    collection: "選択したコレクションをロードできませんでした。",
    canvas: "選択したキャンバスを読み込めませんでした。",
  },
  resource: {
    create: "リソースの作成",
    chooseType: "リソースの種類を選択してください",
    label: "ラベル",
    url: "URL",
    invalidUrl: "有効な URL を入力してください",
    createFailed: "このリソースを作成できませんでした",
  },
  canvas: {
    create: "キャンバスの作成",
    width: "幅",
    height: "身長",
    duration: "間隔",
  },
  image: {
    fromUrl: "画像 URL",
    fromService: "IIIF イメージ サービス",
    browse: "画像を閲覧する",
    previewAlt: "選択したリソースのプレビュー",
    use: "使用イメージ",
  },
  content: {
    webPage: "ウェブページ",
    manifest: "マニフェスト",
    collection: "コレクション",
  },
} as const;
