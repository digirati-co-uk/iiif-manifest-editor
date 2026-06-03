import type { InternationalString } from "@iiif/presentation-3";

export const CANVAS_LABEL_PATTERN_PRESETS = [
  { id: "page", label: "Page {n}", pattern: "Page {n}" },
  { id: "plate", label: "Plate {n}", pattern: "Plate {n}" },
  { id: "image", label: "Image {n}", pattern: "Image {n}" },
  { id: "filename", label: "Source filename", pattern: "{filename}" },
  { id: "label", label: "Imported IIIF label", pattern: "{label}" },
  { id: "range-page", label: "Range/chapter prefix", pattern: "{range}: Page {n}" },
] as const;

export type CanvasLabelNumberStyle =
  | "arabic"
  | "roman-upper"
  | "roman-lower"
  | "alphabetic-upper"
  | "alphabetic-lower"
  | "folio";

export type CanvasLabelFilenameOptions = {
  urlDecode: boolean;
  stripExtension: boolean;
  replaceSeparators: boolean;
  collapseWhitespace: boolean;
  titleCase: boolean;
};

export type CanvasLabelGeneratorRunOptions = {
  pattern: string;
  language: string;
  onlyUntitled: boolean;
  start: number;
  increment: number;
  padWidth: number;
  numberStyle: CanvasLabelNumberStyle;
  restartPerRange: boolean;
  filename: CanvasLabelFilenameOptions;
};

export type CanvasLabelGeneratorPluginSettings = {
  [key: string]: unknown;
  defaultLanguage?: string;
  defaultPattern?: string;
  onlyUntitled?: boolean;
};

export type CanvasLabelPreviewInput = {
  canvasId: string;
  canvasIndex: number;
  currentLabel: InternationalString | string | null | undefined;
  currentLabelText: string;
  currentLanguageValue: string;
  labelFingerprint: string;
  filename: string;
  filenameSource: "painting" | "canvas-id";
  rangeLabel: string;
  rangeIndex: number;
  warnings: string[];
};

export type CanvasLabelPreviewStatus = "changed" | "unchanged" | "skipped";

export type CanvasLabelPreviewItem = {
  canvasId: string;
  canvasIndex: number;
  previousLabel: string;
  previousLanguageValue: string;
  labelFingerprint: string;
  generatedLabel: string;
  status: CanvasLabelPreviewStatus;
  skipReason?: string;
  warnings: string[];
};

export type CanvasLabelPreview = {
  total: number;
  changed: number;
  unchanged: number;
  skipped: number;
  warnings: number;
  items: CanvasLabelPreviewItem[];
};

export function getDefaultRunOptions(): CanvasLabelGeneratorRunOptions {
  return {
    pattern: "Page {n}",
    language: "en",
    onlyUntitled: false,
    start: 1,
    increment: 1,
    padWidth: 0,
    numberStyle: "arabic",
    restartPerRange: false,
    filename: {
      urlDecode: true,
      stripExtension: true,
      replaceSeparators: true,
      collapseWhitespace: true,
      titleCase: false,
    },
  };
}

export function applyCanvasLabelGeneratorPluginSettings(
  defaults: CanvasLabelGeneratorRunOptions,
  settings: Partial<CanvasLabelGeneratorPluginSettings> = {},
): CanvasLabelGeneratorRunOptions {
  return normaliseRunOptions({
    ...defaults,
    language: typeof settings.defaultLanguage === "string" ? settings.defaultLanguage : defaults.language,
    pattern: typeof settings.defaultPattern === "string" ? settings.defaultPattern : defaults.pattern,
    onlyUntitled: typeof settings.onlyUntitled === "boolean" ? settings.onlyUntitled : defaults.onlyUntitled,
  });
}

export function normaliseRunOptions(options: Partial<CanvasLabelGeneratorRunOptions>): CanvasLabelGeneratorRunOptions {
  const defaults = getDefaultRunOptions();
  const style = options.numberStyle || defaults.numberStyle;
  const filename = { ...defaults.filename, ...(options.filename || {}) };

  return {
    pattern: typeof options.pattern === "string" && options.pattern.trim() ? options.pattern : defaults.pattern,
    language: normaliseLanguage(options.language || defaults.language),
    onlyUntitled: options.onlyUntitled === true,
    start: normaliseInteger(options.start, defaults.start),
    increment: normaliseInteger(options.increment, defaults.increment) || defaults.increment,
    padWidth: Math.max(0, Math.min(8, normaliseInteger(options.padWidth, defaults.padWidth))),
    numberStyle: isNumberStyle(style) ? style : defaults.numberStyle,
    restartPerRange: options.restartPerRange === true,
    filename: {
      urlDecode: filename.urlDecode !== false,
      stripExtension: filename.stripExtension !== false,
      replaceSeparators: filename.replaceSeparators !== false,
      collapseWhitespace: filename.collapseWhitespace !== false,
      titleCase: filename.titleCase === true,
    },
  };
}

export function createCanvasLabelPreview(
  inputs: CanvasLabelPreviewInput[],
  rawOptions: Partial<CanvasLabelGeneratorRunOptions>,
): CanvasLabelPreview {
  const options = normaliseRunOptions(rawOptions);
  const items = inputs.map((input) => createCanvasLabelPreviewItem(input, options));
  const duplicateCounts = new Map<string, number>();

  for (const item of items) {
    const key = item.generatedLabel.trim().toLowerCase();
    if (key) {
      duplicateCounts.set(key, (duplicateCounts.get(key) || 0) + 1);
    }
  }

  for (const item of items) {
    const key = item.generatedLabel.trim().toLowerCase();
    if (key && (duplicateCounts.get(key) || 0) > 1) {
      item.warnings.push("Generated label duplicates another canvas");
    }
  }

  return {
    total: items.length,
    changed: items.filter((item) => item.status === "changed").length,
    unchanged: items.filter((item) => item.status === "unchanged").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    warnings: items.reduce((total, item) => total + item.warnings.length, 0),
    items,
  };
}

export function createCanvasLabelPreviewItem(
  input: CanvasLabelPreviewInput,
  options: CanvasLabelGeneratorRunOptions,
): CanvasLabelPreviewItem {
  const generatedLabel = generateCanvasLabel(input, options);
  const currentLanguageValue = getLanguageValue(input.currentLabel, options.language);
  const currentLabelText = getLabelText(input.currentLabel, options.language);
  const warnings = [...input.warnings];
  let status: CanvasLabelPreviewStatus = "changed";
  let skipReason: string | undefined;

  if (!generatedLabel) {
    status = "skipped";
    skipReason = "Generated label is empty";
  } else if (options.onlyUntitled && !isUntitledLabel(input.currentLabel)) {
    status = "skipped";
    skipReason = "Canvas is not untitled";
  } else if (generatedLabel === currentLanguageValue) {
    status = "unchanged";
    skipReason = "Label is already up to date";
  }

  return {
    canvasId: input.canvasId,
    canvasIndex: input.canvasIndex,
    previousLabel: currentLabelText,
    previousLanguageValue: currentLanguageValue,
    labelFingerprint: input.labelFingerprint,
    generatedLabel,
    status,
    skipReason,
    warnings,
  };
}

export function generateCanvasLabel(input: CanvasLabelPreviewInput, rawOptions: Partial<CanvasLabelGeneratorRunOptions>) {
  const options = normaliseRunOptions(rawOptions);
  const globalIndex = input.canvasIndex;
  const rangeIndex = Math.max(1, input.rangeIndex || globalIndex + 1);
  const numberIndex = options.restartPerRange ? rangeIndex - 1 : globalIndex;
  const pattern = options.pattern || "Page {n}";

  return cleanRenderedLabel(
    pattern.replace(/\{(n|rangeIndex)(?::0?(\d+))?\}|\{(filename|label|range)\}/g, (_match, numberToken, pad, textToken) => {
      if (numberToken === "n") {
        return formatSequenceNumber(options.start + numberIndex * options.increment, {
          ...options,
          padWidth: pad ? Number(pad) : options.padWidth,
        });
      }

      if (numberToken === "rangeIndex") {
        return formatSequenceNumber(options.start + (rangeIndex - 1) * options.increment, {
          ...options,
          padWidth: pad ? Number(pad) : options.padWidth,
        });
      }

      if (textToken === "filename") {
        return normaliseFilenameCandidate(input.filename, options.filename);
      }

      if (textToken === "label") {
        return cleanText(getLabelText(input.currentLabel, options.language), options.filename.titleCase);
      }

      if (textToken === "range") {
        return cleanText(input.rangeLabel, options.filename.titleCase);
      }

      return "";
    }),
    options.filename.titleCase,
  );
}

export function formatSequenceNumber(value: number, options: Pick<CanvasLabelGeneratorRunOptions, "numberStyle" | "padWidth">) {
  const number = Math.max(1, Math.trunc(value));

  switch (options.numberStyle) {
    case "roman-upper":
      return toRoman(number).toUpperCase();
    case "roman-lower":
      return toRoman(number).toLowerCase();
    case "alphabetic-upper":
      return toAlphabetic(number).toUpperCase();
    case "alphabetic-lower":
      return toAlphabetic(number).toLowerCase();
    case "folio":
      return `${Math.floor((number + 1) / 2)}${number % 2 === 1 ? "r" : "v"}`;
    case "arabic":
    default:
      return `${number}`.padStart(options.padWidth, "0");
  }
}

export function extractFilenameFromSource(
  source: string | undefined,
  fallbackId: string,
  options: CanvasLabelFilenameOptions = getDefaultRunOptions().filename,
) {
  const raw = getFilenameCandidate(source) || getFilenameCandidate(fallbackId) || fallbackId;
  return normaliseFilenameCandidate(raw, options);
}

export function getFilenameCandidateFromSource(source: string | undefined, fallbackId: string) {
  return getFilenameCandidate(source) || getFilenameCandidate(fallbackId) || fallbackId;
}

export function normaliseFilenameCandidate(value: string, options: CanvasLabelFilenameOptions) {
  let filename = value;

  if (options.urlDecode) {
    filename = safeDecodeURIComponent(filename);
  }

  if (options.stripExtension) {
    filename = filename.replace(/\.[A-Za-z0-9]{1,8}$/, "");
  }

  if (options.replaceSeparators) {
    filename = filename.replace(/[_-]+/g, " ");
  }

  if (options.collapseWhitespace) {
    filename = filename.replace(/\s+/g, " ").trim();
  }

  if (options.titleCase) {
    filename = toTitleCase(filename);
  }

  return filename.trim();
}

export function isUntitledLabel(value: InternationalString | string | null | undefined): boolean {
  const values = getLabelValues(value);
  if (!values.length) {
    return true;
  }

  return values.every((candidate) => {
    const text = candidate.trim().toLowerCase();
    return !text || text === "untitled" || text === "untitled canvas";
  });
}

export function getLabelText(value: InternationalString | string | null | undefined, preferredLanguage = "en") {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  const preferred = getLanguageValue(value, preferredLanguage);
  if (preferred) {
    return preferred;
  }

  return getLabelValues(value)[0] || "";
}

export function getLanguageValue(value: InternationalString | string | null | undefined, language: string) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return language === "none" ? value : "";
  }

  const languageValue = (value as Record<string, unknown>)[language];
  if (Array.isArray(languageValue)) {
    return languageValue.filter(Boolean).join(", ");
  }

  if (typeof languageValue === "string") {
    return languageValue;
  }

  return "";
}

export function setLabelLanguageValue(
  value: InternationalString | string | null | undefined,
  language: string,
  label: string,
): InternationalString {
  const next: InternationalString = {};

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, values] of Object.entries(value)) {
      next[key] = Array.isArray(values) ? [...values] : [String(values || "")];
    }
  } else if (typeof value === "string" && value.trim()) {
    next.none = [value];
  }

  next[normaliseLanguage(language)] = [label];
  return next;
}

export function getLabelFingerprint(value: InternationalString | string | null | undefined) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  const normalised: Record<string, string[]> = {};
  for (const key of Object.keys(value).sort()) {
    const item = (value as Record<string, unknown>)[key];
    normalised[key] = Array.isArray(item) ? item.map((entry) => String(entry)) : [String(item || "")];
  }

  return JSON.stringify(normalised);
}

function getLabelValues(value: InternationalString | string | null | undefined) {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  }

  const values: string[] = [];
  for (const candidate of Object.values(value)) {
    if (Array.isArray(candidate)) {
      values.push(...candidate.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0));
    }
  }

  return values;
}

function cleanRenderedLabel(value: string, titleCase: boolean) {
  return cleanText(value, titleCase)
    .replace(/\s+([,.:;])/g, "$1")
    .replace(/^[\s:;,-]+/g, "")
    .replace(/[\s:;,-]+$/g, "")
    .trim();
}

function cleanText(value: string, titleCase: boolean) {
  const collapsed = value.replace(/\s+/g, " ").trim();
  return titleCase ? toTitleCase(collapsed) : collapsed;
}

function getFilenameCandidate(source: string | undefined) {
  if (!source) {
    return "";
  }

  const withoutQuery = source.split("#")[0]?.split("?")[0] || source;
  const path = getPathname(withoutQuery);
  const parts = path.split("/").filter(Boolean);
  const basename = parts[parts.length - 1] || withoutQuery;

  if (/^default\.[A-Za-z0-9]+$/i.test(basename)) {
    const fullIndex = parts.lastIndexOf("full");
    if (fullIndex > 0) {
      return parts[fullIndex - 1] || basename;
    }
  }

  if (basename === "info.json" && parts.length > 1) {
    return parts[parts.length - 2] || basename;
  }

  return basename;
}

function getPathname(value: string) {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
}

function normaliseLanguage(value: string) {
  const language = value.trim();
  return language || "en";
}

function normaliseInteger(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

function isNumberStyle(value: string): value is CanvasLabelNumberStyle {
  return (
    value === "arabic" ||
    value === "roman-upper" ||
    value === "roman-lower" ||
    value === "alphabetic-upper" ||
    value === "alphabetic-lower" ||
    value === "folio"
  );
}

function toRoman(value: number) {
  const numerals: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let output = "";

  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      output += numeral;
      remaining -= amount;
    }
  }

  return output;
}

function toAlphabetic(value: number) {
  let remaining = value;
  let output = "";

  while (remaining > 0) {
    remaining -= 1;
    output = String.fromCharCode(65 + (remaining % 26)) + output;
    remaining = Math.floor(remaining / 26);
  }

  return output || "A";
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : word))
    .join(" ");
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
