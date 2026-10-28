import { composeResources } from "./composition.ts";
import { createCatalogRegistry } from "./loaders.ts";
import { createCatalogContract } from "./validation.ts";
import type { BuiltinNamespace } from "./catalog-types.ts";
import type { Catalog, ResourceStore } from "./schema.ts";
export type { BuiltinNamespace, SourceCatalogs } from "./catalog-types.ts";

/** These catalogs cover the seed keys, not the complete existing application. */
export const localeDefinitions = Object.freeze([
  { id: "en-GB", nativeName: "English (United Kingdom)", direction: "ltr" as const },
]);
export const wordingProfiles = Object.freeze(["standard", "plain"] as const);
export const builtinLoaders = {
  common: () => import("./locales/en-GB/common.ts").then((module) => module.catalog),
  shell: () => import("./locales/en-GB/shell.ts").then((module) => module.catalog),
  editors: () => import("./locales/en-GB/editors.ts").then((module) => module.catalog),
  creators: () => import("./locales/en-GB/creators.ts").then((module) => module.catalog),
  manifest: () => import("./locales/en-GB/manifest.ts").then((module) => module.catalog),
  collection: () => import("./locales/en-GB/collection.ts").then((module) => module.catalog),
  exhibition: () => import("./locales/en-GB/exhibition.ts").then((module) => module.catalog),
  components: () => import("./locales/en-GB/components.ts").then((module) => module.catalog),
  ui: () => import("./locales/en-GB/ui.ts").then((module) => module.catalog),
  projects: () => import("./locales/en-GB/projects.ts").then((module) => module.catalog),
  "editor-api": () => import("./locales/en-GB/editor-api.ts").then((module) => module.catalog),
  "creator-api": () => import("./locales/en-GB/creator-api.ts").then((module) => module.catalog),
  web: () => import("./locales/en-GB/web.ts").then((module) => module.catalog),
  "plugin-annotations": () => import("./locales/en-GB/plugin-annotations.ts").then((module) => module.catalog),
  "plugin-canvas-label-generator": () =>
    import("./locales/en-GB/plugin-canvas-label-generator.ts").then((module) => module.catalog),
  "plugin-ocr-classification": () =>
    import("./locales/en-GB/plugin-ocr-classification.ts").then((module) => module.catalog),
  "plugin-ocr-docling": () => import("./locales/en-GB/plugin-ocr-docling.ts").then((module) => module.catalog),
  "plugin-specifications": () => import("./locales/en-GB/plugin-specifications.ts").then((module) => module.catalog),
  "plugin-translation": () => import("./locales/en-GB/plugin-translation.ts").then((module) => module.catalog),
} satisfies Record<BuiltinNamespace, () => Promise<Catalog>>;
export const builtinNamespaces = Object.freeze(Object.keys(builtinLoaders) as BuiltinNamespace[]);

export async function createBuiltinRegistry(namespaces: readonly BuiltinNamespace[]) {
  const registry = createCatalogRegistry();
  await Promise.all(
    [...new Set(namespaces)].map(async (namespace) => {
      const source = await builtinLoaders[namespace]();
      registry.register({
        owner: "@manifest-editor/languages",
        namespace,
        sourceLocale: "en-GB",
        contract: createCatalogContract(source),
        loaders: { "en-GB": async () => source },
      });
    })
  );
  return registry;
}

const plainLoaders: Partial<Record<BuiltinNamespace, () => Promise<Catalog>>> = {
  editors: () => import("./profiles/plain/en-GB/editors.ts").then((module) => module.catalog),
  creators: () => import("./profiles/plain/en-GB/creators.ts").then((module) => module.catalog),
  manifest: () => import("./profiles/plain/en-GB/manifest.ts").then((module) => module.catalog),
  exhibition: () => import("./profiles/plain/en-GB/exhibition.ts").then((module) => module.catalog),
};

/** Demonstrates the actual layer policy with built-in seeds; a public runtime will add host locale loaders. */
export async function prepareBuiltinResources(options: {
  namespaces: readonly BuiltinNamespace[];
  profile?: "standard" | "plain";
  preset?: "manifest" | "collection" | "exhibition";
  host?: ResourceStore;
}) {
  const registry = await createBuiltinRegistry(options.namespaces);
  const base = await registry.load(["en-GB"], options.namespaces);
  const profile: Record<string, Catalog> = {};
  if (options.profile === "plain")
    await Promise.all(
      options.namespaces.map(async (namespace) => {
        const load = plainLoaders[namespace];
        if (load) profile[namespace] = await load();
      })
    );
  const preset =
    options.preset === "exhibition" && options.namespaces.includes("editors")
      ? { "en-GB": { editors: (await import("./presets/exhibition/en-GB/editors.ts")).catalog } }
      : {};
  const presetProfile =
    options.preset === "exhibition" && options.profile === "plain" && options.namespaces.includes("editors")
      ? { "en-GB": { editors: (await import("./presets/exhibition/plain/en-GB/editors.ts")).catalog } }
      : {};
  const resources = composeResources(
    {
      base,
      presets: [preset],
      profile: { "en-GB": profile },
      presetProfile,
      ...(options.host ? { host: options.host } : {}),
    },
    registry.contracts()
  );
  return { resources, contracts: registry.contracts(), coverage: "seed" as const };
}
