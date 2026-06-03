export type M2M100Language = {
  code: string;
  label: string;
};

export type LanguageProgressSummary = {
  total: number;
  existing: number;
  suggested?: number;
};

export const M2M100_LANGUAGES: M2M100Language[] = [
  { code: "af", label: "Afrikaans" },
  { code: "am", label: "Amharic" },
  { code: "ar", label: "Arabic" },
  { code: "ast", label: "Asturian" },
  { code: "az", label: "Azerbaijani" },
  { code: "ba", label: "Bashkir" },
  { code: "be", label: "Belarusian" },
  { code: "bg", label: "Bulgarian" },
  { code: "bn", label: "Bengali" },
  { code: "br", label: "Breton" },
  { code: "bs", label: "Bosnian" },
  { code: "ca", label: "Catalan; Valencian" },
  { code: "ceb", label: "Cebuano" },
  { code: "cs", label: "Czech" },
  { code: "cy", label: "Welsh" },
  { code: "da", label: "Danish" },
  { code: "de", label: "German" },
  { code: "el", label: "Greek" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "et", label: "Estonian" },
  { code: "fa", label: "Persian" },
  { code: "ff", label: "Fulah" },
  { code: "fi", label: "Finnish" },
  { code: "fr", label: "French" },
  { code: "fy", label: "Western Frisian" },
  { code: "ga", label: "Irish" },
  { code: "gd", label: "Gaelic; Scottish Gaelic" },
  { code: "gl", label: "Galician" },
  { code: "gu", label: "Gujarati" },
  { code: "ha", label: "Hausa" },
  { code: "he", label: "Hebrew" },
  { code: "hi", label: "Hindi" },
  { code: "hr", label: "Croatian" },
  { code: "ht", label: "Haitian; Haitian Creole" },
  { code: "hu", label: "Hungarian" },
  { code: "hy", label: "Armenian" },
  { code: "id", label: "Indonesian" },
  { code: "ig", label: "Igbo" },
  { code: "ilo", label: "Iloko" },
  { code: "is", label: "Icelandic" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "jv", label: "Javanese" },
  { code: "ka", label: "Georgian" },
  { code: "kk", label: "Kazakh" },
  { code: "km", label: "Central Khmer" },
  { code: "kn", label: "Kannada" },
  { code: "ko", label: "Korean" },
  { code: "lb", label: "Luxembourgish; Letzeburgesch" },
  { code: "lg", label: "Ganda" },
  { code: "ln", label: "Lingala" },
  { code: "lo", label: "Lao" },
  { code: "lt", label: "Lithuanian" },
  { code: "lv", label: "Latvian" },
  { code: "mg", label: "Malagasy" },
  { code: "mk", label: "Macedonian" },
  { code: "ml", label: "Malayalam" },
  { code: "mn", label: "Mongolian" },
  { code: "mr", label: "Marathi" },
  { code: "ms", label: "Malay" },
  { code: "my", label: "Burmese" },
  { code: "ne", label: "Nepali" },
  { code: "nl", label: "Dutch; Flemish" },
  { code: "no", label: "Norwegian" },
  { code: "ns", label: "Northern Sotho" },
  { code: "oc", label: "Occitan" },
  { code: "or", label: "Oriya" },
  { code: "pa", label: "Panjabi; Punjabi" },
  { code: "pl", label: "Polish" },
  { code: "ps", label: "Pushto; Pashto" },
  { code: "pt", label: "Portuguese" },
  { code: "ro", label: "Romanian; Moldavian; Moldovan" },
  { code: "ru", label: "Russian" },
  { code: "sd", label: "Sindhi" },
  { code: "si", label: "Sinhala; Sinhalese" },
  { code: "sk", label: "Slovak" },
  { code: "sl", label: "Slovenian" },
  { code: "so", label: "Somali" },
  { code: "sq", label: "Albanian" },
  { code: "sr", label: "Serbian" },
  { code: "ss", label: "Swati" },
  { code: "su", label: "Sundanese" },
  { code: "sv", label: "Swedish" },
  { code: "sw", label: "Swahili" },
  { code: "ta", label: "Tamil" },
  { code: "th", label: "Thai" },
  { code: "tl", label: "Tagalog" },
  { code: "tn", label: "Tswana" },
  { code: "tr", label: "Turkish" },
  { code: "uk", label: "Ukrainian" },
  { code: "ur", label: "Urdu" },
  { code: "uz", label: "Uzbek" },
  { code: "vi", label: "Vietnamese" },
  { code: "wo", label: "Wolof" },
  { code: "xh", label: "Xhosa" },
  { code: "yi", label: "Yiddish" },
  { code: "yo", label: "Yoruba" },
  { code: "zh", label: "Chinese" },
  { code: "zu", label: "Zulu" },
];

const supportedLanguageCodes = new Set(
  M2M100_LANGUAGES.map((language) => language.code),
);

export function isSupportedM2M100Language(
  code: string | null | undefined,
): boolean {
  return !!code && supportedLanguageCodes.has(code);
}

export function getLanguageLabel(code: string) {
  return (
    M2M100_LANGUAGES.find((language) => language.code === code)?.label || code
  );
}

export function getLanguageProgressLabel(progress: LanguageProgressSummary) {
  if (!progress.total) {
    return "0";
  }

  const done = progress.existing + (progress.suggested || 0);
  return `${Math.round((done / progress.total) * 100)}%`;
}
