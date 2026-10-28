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
});
