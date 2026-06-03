import type { Config } from "@manifest-editor/shell";
import { isSupportedM2M100Language } from "./languages";
import type {
  TranslationContentFilters,
  TranslationPluginSettings,
  TranslationRunOptions,
  TranslationRuntimePreference,
} from "./types";

const defaultSourceLanguage = "en";
const defaultTargetLanguage = "nl";
export const TRANSLATION_NONE_LANGUAGE = "none";

export const defaultTranslationContentFilters: TranslationContentFilters = {
  annotationBodies: true,
  canvasLabels: true,
};

export function getDefaultRunOptions(
  config?: Partial<Config> | null,
  settings: TranslationPluginSettings = {},
): TranslationRunOptions {
  const availableLanguages = getSupportedAvailableLanguages(config);
  const sourceLanguage =
    resolveSourceLanguage(settings.defaultSourceLanguage) ||
    resolveSupportedLanguage(config?.i18n?.defaultLanguage) ||
    availableLanguages[0] ||
    defaultSourceLanguage;
  const modelSourceLanguage =
    resolveSupportedLanguage(settings.defaultSourceLanguage) ||
    resolveSupportedLanguage(config?.i18n?.defaultLanguage) ||
    availableLanguages[0] ||
    defaultSourceLanguage;
  const targetLanguage =
    resolveSupportedLanguage(settings.defaultTargetLanguage, modelSourceLanguage) ||
    availableLanguages.find((language) => language !== modelSourceLanguage) ||
    (modelSourceLanguage === defaultTargetLanguage
      ? defaultSourceLanguage
      : defaultTargetLanguage);

  return normaliseRunOptions({
    sourceLanguage,
    modelSourceLanguage,
    targetLanguage,
    runtime: settings.runtimePreference,
    writePolicy: "fill-missing",
  });
}

export function normaliseRunOptions(
  options: Partial<TranslationRunOptions> = {},
): TranslationRunOptions {
  const sourceLanguage =
    resolveSourceLanguage(options.sourceLanguage) || defaultSourceLanguage;
  const modelSourceLanguage = getModelSourceLanguage(sourceLanguage, options);
  const targetLanguage =
    resolveSupportedLanguage(options.targetLanguage, modelSourceLanguage) ||
    (modelSourceLanguage === defaultTargetLanguage
      ? defaultSourceLanguage
      : defaultTargetLanguage);

  return {
    sourceLanguage,
    modelSourceLanguage,
    targetLanguage,
    runtime: normaliseRuntimePreference(options.runtime),
    writePolicy: "fill-missing",
    contentFilters: normaliseContentFilters(options.contentFilters),
    currentResourceOnly: options.currentResourceOnly === true,
  };
}

export function getSupportedAvailableLanguages(
  config?: Partial<Config> | null,
): string[] {
  const configured = config?.i18n?.availableLanguages || [];
  const supported: string[] = [];

  for (const language of configured) {
    const resolved = resolveSupportedLanguage(language);
    if (resolved && !supported.includes(resolved)) {
      supported.push(resolved);
    }
  }

  return supported;
}

export function resolveSupportedLanguage(
  language: unknown,
  disallow?: string,
): string | null {
  if (typeof language !== "string") {
    return null;
  }

  const normalised = normaliseLanguageCode(language);
  if (!normalised || normalised === disallow) {
    return null;
  }

  if (isSupportedM2M100Language(normalised)) {
    return normalised;
  }

  const baseLanguage = normalised.split("-")[0] || "";
  if (
    baseLanguage !== normalised &&
    baseLanguage !== disallow &&
    isSupportedM2M100Language(baseLanguage)
  ) {
    return baseLanguage;
  }

  return null;
}

export function resolveSourceLanguage(language: unknown): string | null {
  if (isNoLanguageCode(language)) {
    return TRANSLATION_NONE_LANGUAGE;
  }

  return resolveSupportedLanguage(language);
}

export function getModelSourceLanguage(
  sourceLanguage: unknown,
  options: Partial<TranslationRunOptions> = {},
) {
  return (
    resolveSupportedLanguage(sourceLanguage) ||
    resolveSupportedLanguage(options.modelSourceLanguage) ||
    defaultSourceLanguage
  );
}

export function isNoLanguageCode(language: unknown) {
  return typeof language === "string" && normaliseLanguageCode(language) === TRANSLATION_NONE_LANGUAGE;
}

export function normaliseLanguageCode(language: string) {
  return language.trim().replace(/_/g, "-").toLowerCase();
}

function normaliseRuntimePreference(
  value: unknown,
): TranslationRuntimePreference {
  return value === "webgpu" || value === "wasm" || value === "auto"
    ? value
    : "auto";
}

function normaliseContentFilters(value: unknown): TranslationContentFilters {
  const filters =
    value && typeof value === "object"
      ? (value as Partial<TranslationContentFilters>)
      : {};

  return {
    annotationBodies:
      typeof filters.annotationBodies === "boolean"
        ? filters.annotationBodies
        : defaultTranslationContentFilters.annotationBodies,
    canvasLabels:
      typeof filters.canvasLabels === "boolean"
        ? filters.canvasLabels
        : defaultTranslationContentFilters.canvasLabels,
  };
}
