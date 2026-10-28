import { describe, expect, it } from "vitest";
import { createCatalogContract, createMessageReference } from "../src/messages";
import { createEditorI18n, defaultLocales } from "../src/runtime";
import type { EditorI18nOptions, TranslationDiagnostic } from "../src/types";

const locales = [
  ...defaultLocales,
  { id: "fr", nativeName: "Français", direction: "ltr" as const },
  { id: "ru", nativeName: "Русский", direction: "ltr" as const },
];
const catalogs = {
  "en-GB": { example: { count_one: "{{count}} item", count_other: "{{count}} items", greeting: "Hello {{name}}" } },
  fr: { example: { count_one: "{{count}} élément", count_other: "{{count}} éléments" } },
};
const options: EditorI18nOptions = { locales, catalogs, requiredNamespaces: ["example"] };

describe("isolated i18next runtime", () => {
  it("initializes synchronously, supports real plurals and English fallback with English rules", () => {
    const diagnostics: TranslationDiagnostic[] = [];
    const runtime = createEditorI18n({ ...options, locale: "fr", onDiagnostic: (d) => diagnostics.push(d) });
    expect(runtime.translate("example")("count", { count: 0 })).toBe("0 élément");
    expect(runtime.translate("example")("count", { count: 2 })).toBe("2 éléments");
    expect(runtime.translate("example")("greeting", { name: "Ada" })).toBe("Hello Ada");
    expect(diagnostics.at(-1)?.kind).toBe("fallback");
    expect(runtime.getSnapshot().coverage).toEqual({
      complete: false,
      missing: ["example:greeting", "example:count_many"],
    });
    const russian = createEditorI18n({ ...options, locale: "ru" });
    expect(russian.translate("example")("count", { count: 21 })).toBe("21 items");
    expect(runtime.translate("third-party")("new.key", {}, { defaultValue: "Incremental" })).toBe("Incremental");
    expect(diagnostics.at(-1)?.kind).toBe("missing");
  });
  it("keeps references serialisable, resolves at call time and separates instances", async () => {
    const a = createEditorI18n(options);
    const b = createEditorI18n({ ...options, locale: "fr" });
    const reference = JSON.parse(JSON.stringify({ namespace: "example", key: "count", values: { count: 2 } }));
    expect(a.resolveMessage(reference)).toBe("2 items");
    expect(b.resolveMessage(reference)).toBe("2 éléments");
    await a.setLocale("fr");
    expect(a.resolveMessage(reference)).toBe("2 éléments");
    expect(a.resolveMessage("Authored IIIF label")).toBe("Authored IIIF label");
    expect(a.resolveMessage(undefined, "Legacy")).toBe("Legacy");
    expect(a.resolveMessage(createMessageReference("external", "absent"))).toBe("absent");
    expect(() => createMessageReference("example", "greeting", { values: { count: Infinity } })).toThrow("finite");
    expect(a.translate("example")("greeting", { name: "{{other}}", lng: "fr" })).toBe("Hello {{other}}");
  });
  it("composes base, inherited presets, profile, preset profile and host in order", async () => {
    const layer = (greeting: string) => ({ "en-GB": { example: { greeting } } });
    const runtime = createEditorI18n({
      ...options,
      presets: [layer("Preset {{name}}")],
      profiles: { plain: layer("Plain {{name}}") },
      presetProfiles: { plain: layer("Specific {{name}}") },
      host: layer("Host {{name}}"),
    });
    await runtime.setProfile("plain");
    expect(runtime.translate("example")("greeting", { name: "A" })).toBe("Host A");
    expect(runtime.getSnapshot().locale).toBe("en-GB");
  });
  it("ignores superseded loads and preserves the prior snapshot after failure; retries work", async () => {
    const source = { title: "English" };
    let release!: (value: typeof source) => void;
    const runtime = createEditorI18n({
      ...options,
      registrations: [
        {
          owner: "plugin",
          namespace: "plugin-test",
          sourceLocale: "en-GB",
          contract: createCatalogContract(source),
          loaders: {
            "en-GB": async () => source,
            fr: () =>
              new Promise((resolve) => {
                release = resolve;
              }),
          },
        },
      ],
    });
    const first = runtime.setLocale("fr");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await runtime.setLocale("en-GB");
    release({ title: "French" });
    await first;
    expect(runtime.getSnapshot().locale).toBe("en-GB");
    expect(runtime.getSnapshot().loading).toBe(false);
    expect(runtime.translate("plugin-test")("title")).toBe("English");
  });
  it("commits locale, profile and loaded resources together after overlapping requests", async () => {
    const source = { title: "English" };
    let release!: (value: typeof source) => void;
    const runtime = createEditorI18n({
      ...options,
      registrations: [
        {
          owner: "plugin",
          namespace: "plugin-test",
          sourceLocale: "en-GB",
          contract: createCatalogContract(source),
          loaders: {
            "en-GB": async () => source,
            fr: () =>
              new Promise((resolve) => {
                release = resolve;
              }),
          },
        },
      ],
    });
    const first = runtime.setLocale("fr");
    await new Promise((resolve) => setTimeout(resolve, 0));
    const second = runtime.setProfile("plain");
    expect(runtime.getSnapshot()).toMatchObject({ locale: "en-GB", profile: "standard", loading: true });
    release({ title: "French" });
    await Promise.all([first, second]);
    expect(runtime.getSnapshot()).toMatchObject({ locale: "fr", profile: "plain", loading: false });
    expect(runtime.translate("plugin-test")("title")).toBe("French");
  });
  it("retains old resources on loader failure and retries failed loaders", async () => {
    let fail = true;
    const source = { title: "English" };
    const runtime = createEditorI18n({
      ...options,
      registrations: [
        {
          owner: "plugin",
          namespace: "plugin-test",
          sourceLocale: "en-GB",
          contract: createCatalogContract(source),
          loaders: {
            "en-GB": async () => source,
            fr: async () => {
              if (fail) throw new Error("offline");
              return { title: "French" };
            },
          },
        },
      ],
    });
    await runtime.loadNamespaces(["plugin-test"]);
    await expect(runtime.setLocale("fr")).rejects.toThrow("offline");
    expect(runtime.getSnapshot()).toMatchObject({ locale: "en-GB", loading: false });
    expect(runtime.getSnapshot().error?.message).toBe("offline");
    expect(runtime.translate("plugin-test")("title")).toBe("English");
    fail = false;
    await runtime.setLocale("fr");
    expect(runtime.translate("plugin-test")("title")).toBe("French");
  });
  it("validates selections and plugin catalogs; allows open third-party keys", async () => {
    const runtime = createEditorI18n(options);
    await expect(runtime.setLocale("de")).rejects.toThrow("unavailable");
    await runtime.register({
      owner: "third-party",
      namespace: "external-plugin",
      sourceLocale: "en-GB",
      contract: createCatalogContract({ arbitrary: { key: "Extension" } }),
      loaders: { "en-GB": async () => ({ arbitrary: { key: "Extension" } }) },
    });
    expect(runtime.translate("external-plugin")("arbitrary.key")).toBe("Extension");
    expect(() => createEditorI18n({ ...options, host: { fr: { example: { greeting: "Missing variable" } } } })).toThrow(
      "placeholders"
    );
    expect(() =>
      createEditorI18n({ ...options, host: { fr: { example: { greeting: '<a href="bad">{{name}}</a>' } } } })
    ).toThrow("attributes");
    expect(() => createEditorI18n({ ...options, policies: [{ availableLocales: ["de"] }] })).toThrow(
      "empty intersection"
    );
  });

  it("rejects numeric markup before it can reach the rich renderer", () => {
    for (const title of ['<0 href="https://evil.example">Hello</0>', "<0>Hello</0>"]) {
      expect(() =>
        createEditorI18n({
          catalogs: { "en-GB": { plain: { title: "Hello" } } },
          host: { "en-GB": { plain: { title } } },
        })
      ).toThrow();
    }
  });

  it("rejects namespace takeovers without poisoning later selection", async () => {
    const runtime = createEditorI18n(options);
    await expect(
      runtime.register({
        owner: "other",
        namespace: "common",
        sourceLocale: "en-GB",
        contract: createCatalogContract({ unrelated: "Other" }),
        loaders: { "en-GB": async () => ({ unrelated: "Other" }) },
      })
    ).rejects.toThrow("owned by the editor");
    await runtime.setProfile("plain");
    expect(runtime.translate("common")("actions.save")).toBe("Save");
    expect(runtime.getSnapshot().error).toBeNull();
  });

  it("failed registrations roll back completely and can be corrected under the same namespace", async () => {
    const runtime = createEditorI18n(options);
    const source = { title: "Hello {{name}}" };
    const registration = {
      owner: "plugin",
      namespace: "plugin-correctable",
      sourceLocale: "en-GB",
      contract: createCatalogContract(source),
    };
    await expect(
      runtime.register({ ...registration, loaders: { "en-GB": async () => ({ title: "Wrong placeholders" }) } })
    ).rejects.toThrow("placeholders");
    await runtime.setProfile("plain");
    expect(runtime.getSnapshot().coverage.missing.some((key) => key.startsWith("plugin-correctable:"))).toBe(false);
    await runtime.register({ ...registration, loaders: { "en-GB": async () => source } });
    expect(runtime.translate("plugin-correctable")("title", { name: "Ada" })).toBe("Hello Ada");
  });

  it("serialises registrations, follows concurrent locale selection and keeps successful loader caches", async () => {
    let release!: (source: { title: string }) => void;
    let sourceLoads = 0;
    const source = { title: "English A" };
    const runtime = createEditorI18n(options);
    const first = runtime.register({
      owner: "a",
      namespace: "plugin-a",
      sourceLocale: "en-GB",
      contract: createCatalogContract(source),
      loaders: {
        "en-GB": () => {
          sourceLoads++;
          return new Promise((resolve) => {
            release = resolve;
          });
        },
        fr: async () => ({ title: "Français A" }),
      },
    });
    const second = runtime.register({
      owner: "b",
      namespace: "plugin-b",
      sourceLocale: "en-GB",
      contract: createCatalogContract(source),
      loaders: { "en-GB": async () => ({ title: "English B" }), fr: async () => ({ title: "Français B" }) },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await runtime.setLocale("fr");
    release(source);
    await Promise.all([first, second]);
    expect(runtime.getSnapshot().locale).toBe("fr");
    expect(runtime.translate("plugin-a")("title")).toBe("Français A");
    expect(runtime.translate("plugin-b")("title")).toBe("Français B");
    await runtime.setLocale("en-GB");
    expect(sourceLoads).toBe(1);
  });

  it("can preload a plugin namespace for SSR and still validate its lazy registration", async () => {
    const source = { title: "Preloaded" };
    const runtime = createEditorI18n({
      catalogs: { "en-GB": { "plugin-preloaded": source } },
      registrations: [
        {
          owner: "preloaded",
          namespace: "plugin-preloaded",
          sourceLocale: "en-GB",
          contract: createCatalogContract(source),
          loaders: { "en-GB": async () => source },
        },
      ],
    });
    expect(runtime.translate("plugin-preloaded")("title")).toBe("Preloaded");
    await runtime.loadNamespaces(["plugin-preloaded"]);
    expect(runtime.translate("plugin-preloaded")("title")).toBe("Preloaded");
  });

  it("allows the official owner to register its existing first-party plugin namespace", async () => {
    const source = (await import("@manifest-editor/languages/locales/en-GB/plugin-annotations")).catalog;
    const runtime = createEditorI18n();
    await expect(
      runtime.register({
        owner: "unrelated-plugin",
        namespace: "plugin-annotations",
        sourceLocale: "en-GB",
        contract: createCatalogContract(source),
        loaders: { "en-GB": async () => source },
      })
    ).rejects.toThrow("owned by the editor");
    await runtime.register({
      owner: "@manifest-editor/annotations",
      namespace: "plugin-annotations",
      sourceLocale: "en-GB",
      contract: createCatalogContract(source),
      loaders: { "en-GB": async () => source },
    });
    expect(runtime.translate("plugin-annotations")("metadata.label")).toBe("Annotations");
  });

  it("unsubscribes runtime listeners before subsequent state changes", async () => {
    const runtime = createEditorI18n(options);
    let changes = 0;
    const unsubscribe = runtime.subscribe(() => {
      changes++;
    });
    await runtime.setProfile("plain");
    expect(changes).toBeGreaterThan(0);
    unsubscribe();
    const previous = changes;
    await runtime.setLocale("fr");
    expect(changes).toBe(previous);
  });
});
