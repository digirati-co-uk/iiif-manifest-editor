/** Public data contracts deliberately do not import the private catalog package. */
export type MessageValue = string | number | boolean | null;
export type MessageValues = Readonly<Record<string, MessageValue>>;
export interface MessageReference {
  readonly namespace: string;
  readonly key: string;
  readonly values?: MessageValues;
  readonly defaultValue?: string;
}
export type Catalog = { readonly [key: string]: string | Catalog };
export type ResourceStore = Readonly<Record<string, Readonly<Record<string, Catalog>>>>;
export interface MessageContract {
  readonly placeholders: readonly string[];
  readonly tags: readonly string[];
  readonly allowEmpty: boolean;
}
export interface CatalogContract {
  readonly messages: Readonly<Record<string, MessageContract>>;
  readonly plurals: Readonly<Record<string, MessageContract>>;
}
export interface LocaleDefinition {
  readonly id: string;
  readonly nativeName: string;
  readonly direction: "ltr" | "rtl";
}
export interface UiI18nConfig {
  readonly defaultLocale: string;
  readonly availableLocales: readonly string[];
  readonly fallbackLocale: string;
  readonly defaultProfile: string;
  readonly availableProfiles: readonly string[];
}
export interface PresetLanguagePolicy {
  readonly availableLocales?: readonly string[];
  readonly availableProfiles?: readonly string[];
  readonly defaultLocale?: string;
  readonly defaultProfile?: string;
}
export interface CatalogRegistration {
  readonly owner: string;
  readonly namespace: string;
  readonly sourceLocale: string;
  readonly contract: CatalogContract;
  readonly loaders: Readonly<Record<string, () => Promise<Catalog>>>;
}
export interface ResourceLayers {
  readonly base: ResourceStore;
  readonly presets?: readonly ResourceStore[];
  readonly profile?: ResourceStore;
  readonly presetProfile?: ResourceStore;
  readonly host?: ResourceStore;
}
export interface TranslationDiagnostic {
  readonly kind: "fallback" | "missing";
  readonly locale: string;
  readonly resolvedLocale?: string;
  readonly namespace: string;
  readonly key: string;
}
/** Serializable resource layers, also suitable for server-to-client preloading. */
export interface EditorI18nResources {
  readonly catalogs?: ResourceStore;
  readonly presets?: readonly ResourceStore[];
  readonly profiles?: Readonly<Record<string, ResourceStore>>;
  readonly presetProfiles?: Readonly<Record<string, ResourceStore>>;
}
export interface LocaleResourceLoader {
  readonly locale: string;
  /** Return only this locale's data. Source contracts must already be registered. */
  readonly load: () => Promise<EditorI18nResources>;
}
export interface EditorI18nOptions extends EditorI18nResources {
  readonly config?: Partial<UiI18nConfig>;
  readonly locales?: readonly LocaleDefinition[];
  readonly policies?: readonly PresetLanguagePolicy[];
  readonly locale?: string;
  readonly profile?: string;
  readonly persistedLocale?: string;
  readonly persistedProfile?: string;
  readonly preferredLocales?: readonly string[];
  /** Optional locale bundles; selections load these before committing any changes. */
  readonly resourceLoaders?: readonly LocaleResourceLoader[];
  readonly host?: ResourceStore;
  readonly registrations?: readonly CatalogRegistration[];
  readonly requiredNamespaces?: readonly string[];
  readonly onDiagnostic?: (diagnostic: TranslationDiagnostic) => void;
}
export type Translate = (key: string, values?: MessageValues, options?: { readonly defaultValue?: string }) => string;
export interface EditorI18nSnapshot {
  readonly locale: string;
  readonly profile: string;
  readonly direction: "ltr" | "rtl";
  readonly localeChain: readonly string[];
  readonly availableLocales: readonly LocaleDefinition[];
  readonly availableProfiles: readonly string[];
  readonly loading: boolean;
  readonly error: Error | null;
  /** Missing keys in the selected locale, excluding fallback. */
  readonly coverage: { readonly complete: boolean; readonly missing: readonly string[] };
}
export interface EditorI18n {
  getSnapshot(): EditorI18nSnapshot;
  subscribe(listener: () => void): () => void;
  setLocale(locale: string): Promise<void>;
  setProfile(profile: string): Promise<void>;
  select(selection: { readonly locale?: string; readonly profile?: string }): Promise<void>;
  /** Loads registered namespaces; failed loads can be retried. */
  loadNamespaces(namespaces: readonly string[]): Promise<void>;
  register(registration: CatalogRegistration): Promise<void>;
  translate(namespace: string): Translate;
  resolveMessage(reference: MessageReference | string | undefined, fallback?: string): string;
}
