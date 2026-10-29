/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "Prázdná stránka",
      summary: "Začněte s rozvržením obrázku nebo prázdnou stránkou",
    },
    internalCanvas: {
      label: "Stávající stránka",
      summary: "Vyberte stránku z této položky.",
    },
    example: {
      label: "Příklad prázdné stránky",
      summary: "Vytvořte velkou prázdnou stránku s názvem.",
    },
    contents: {
      summary: "Vytvořte sekci pro uspořádání obsahu této položky.",
    },
    range: {
      summary: "Seskupte stránky nebo jiné sekce do sekce.",
    },
    highlight: {
      summary: "Označte oblast stránky bez přidání obsahu.",
    },
    html: {
      summary: "Napište formátovaný text, který se má zobrazit na stránce.",
    },
    browser: {
      summary:
        "Procházejte webovou stránku položky, kolekce nebo podporované kolekce IIIF a vyberte obsah, který chcete přidat.",
      copyMetadata: "Zkopírujte podrobnosti položky na importované stránky",
      copyMetadataHelp: "Zkopíruje popisné podrobnosti ze zdrojové položky, když prohlížeč vytvoří stránku.",
    },
    manifestBrowser: {
      summary: "Procházejte položky a kolekce IIIF a vyberte si, co chcete přidat.",
    },
    vtt: {
      summary: "Přidejte titulky nebo titulky ze souboru WebVTT na stránku zvuku nebo videa.",
    },
  },
  browser: {
    selectCanvas: "Vyberte stránku",
    addToManifest: "Přidat k položce",
  },
  errors: {
    vttCanvas: "Titulky WebVTT musí patřit ke stránce.",
    canvas: "Vybranou stránku nelze načíst.",
    manifest: "Vybranou položku nelze načíst.",
  },
  form: {
    vttHelp:
      "Propojte existující soubor WebVTT (.vtt) s touto stránkou. Před přidáním soubor hostujte na veřejném serveru URL.",
    createRange: "Vytvořit sekci",
  },
  resource: {
    create: "Něco přidat",
    chooseType: "Vyberte, co chcete přidat",
  },
  canvas: {
    create: "Přidat stránku",
  },
} as const;
