import {
  createCatalogContract,
  createEditorI18n,
  createMessageReference,
  defaultLocales,
  dutchLocale,
  type CatalogRegistration,
  type EditorI18nOptions,
  type ResourceStore,
} from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain, dutchExhibition, dutchExhibitionPlain } from "@manifest-editor/i18n/nl";

const source = { count_one: "{{count}} item", count_other: "{{count}} items" };
const registration: CatalogRegistration = {
  owner: "external-plugin",
  namespace: "external-plugin",
  sourceLocale: "en-GB",
  contract: createCatalogContract(source),
  loaders: { "en-GB": async () => source },
};
const options: EditorI18nOptions = {
  locales: [...defaultLocales, dutchLocale],
  catalogs: dutchCatalogs,
  profiles: { plain: dutchPlain },
  presets: [dutchExhibition],
  presetProfiles: { plain: dutchExhibitionPlain },
  config: { defaultLocale: "nl" },
  registrations: [registration],
};
const resources: ResourceStore = dutchCatalogs;
void resources;
const instance = createEditorI18n(options);
const reference = createMessageReference("external-plugin", "count", { values: { count: 2 } });
const label: string = instance.resolveMessage(reference);
const loaded: Promise<void> = instance.loadNamespaces(["external-plugin"]);
void label;
void loaded;
