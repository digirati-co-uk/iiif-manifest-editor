/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  definitions: {
    emptyCanvas: {
      label: "खाली पन्ना",
      summary: "एक छवि लेआउट या एक रिक्त पृष्ठ से प्रारंभ करें",
    },
    internalCanvas: {
      label: "मौजूदा पेज",
      summary: "इस आइटम से एक पृष्ठ चुनें.",
    },
    example: {
      label: "रिक्त पृष्ठ उदाहरण",
      summary: "शीर्षक के साथ एक बड़ा खाली पृष्ठ बनाएं.",
    },
    contents: {
      summary: "इस आइटम की सामग्री को व्यवस्थित करने के लिए एक अनुभाग बनाएं।",
    },
    range: {
      summary: "पृष्ठों या अन्य अनुभागों को एक अनुभाग में समूहित करें।",
    },
    highlight: {
      summary: "सामग्री जोड़े बिना पृष्ठ के एक क्षेत्र को चिह्नित करें।",
    },
    html: {
      summary: "किसी पृष्ठ पर प्रदर्शित करने के लिए स्वरूपित पाठ लिखें।",
    },
    browser: {
      summary: "एक IIIF आइटम, संग्रह, या समर्थित संग्रह वेबपेज ब्राउज़ करें और जोड़ने के लिए सामग्री चुनें।",
      copyMetadata: "आयातित पृष्ठों पर आइटम विवरण कॉपी करें",
      copyMetadataHelp: "जब ब्राउज़र कोई पेज बनाता है तो स्रोत आइटम से वर्णनात्मक विवरण कॉपी करता है।",
    },
    manifestBrowser: {
      summary: "जोड़ने के लिए कुछ चुनने के लिए IIIF आइटम और संग्रह ब्राउज़ करें।",
    },
    vtt: {
      summary: "WebVTT फ़ाइल से ऑडियो या वीडियो पेज पर उपशीर्षक या कैप्शन जोड़ें।",
    },
  },
  browser: {
    selectCanvas: "पेज चुनें",
    addToManifest: "आइटम में जोड़ें",
  },
  errors: {
    vttCanvas: "WebVTT कैप्शन एक पेज से संबंधित होना चाहिए।",
    canvas: "चयनित पृष्ठ लोड नहीं हो सका.",
    manifest: "चयनित आइटम लोड नहीं किया जा सका.",
  },
  form: {
    vttHelp: "मौजूदा WebVTT (.vtt) फ़ाइल को इस पृष्ठ से लिंक करें। फ़ाइल को जोड़ने से पहले उसे सार्वजनिक URL पर होस्ट करें।",
    createRange: "अनुभाग बनाएँ",
  },
  resource: {
    create: "कुछ जोड़ें",
    chooseType: "चुनें कि क्या जोड़ना है",
  },
  canvas: {
    create: "पृष्ठ जोड़ें",
  },
} as const;
