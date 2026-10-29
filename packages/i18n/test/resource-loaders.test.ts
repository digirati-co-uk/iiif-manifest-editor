import { describe, expect, it, vi } from "vitest";
import { createEditorI18n, defaultLocales } from "../src/runtime";
import type { EditorI18nResources } from "../src/types";

const locales = [...defaultLocales, { id: "nl", nativeName: "Nederlands", direction: "ltr" as const }];
const catalogs = { nl: { "editor-api": { fields: { label: "Basis" } } } };
const bundle: EditorI18nResources = {
  catalogs,
  presets: [{ nl: { "editor-api": { fields: { label: "Preset" } } } }],
  profiles: { plain: { nl: { "editor-api": { fields: { label: "Eenvoudig" } } } } },
  presetProfiles: { plain: { nl: { "editor-api": { fields: { label: "Specifiek" } } } } },
};

describe("locale resource bundles", () => {
  it("loads only the selected chain, coalesces concurrent loads and caches across profile changes", async () => {
    const load = vi.fn(async () => bundle);
    const runtime = createEditorI18n({ locales, resourceLoaders: [{ locale: "nl", load }] });
    await runtime.select({});
    expect(load).not.toHaveBeenCalled();
    await Promise.all([runtime.setLocale("nl"), runtime.setProfile("plain")]);
    expect(load).toHaveBeenCalledOnce();
    expect(runtime.getSnapshot()).toMatchObject({ locale: "nl", profile: "plain", loading: false });
    expect(runtime.translate("editor-api")("fields.label")).toBe("Specifiek");
    await runtime.setProfile("standard");
    expect(runtime.translate("editor-api")("fields.label")).toBe("Preset");
    await runtime.setLocale("en-GB");
    expect(runtime.translate("editor-api")("fields.label")).toBe("Label");
    await runtime.setLocale("nl");
    expect(load).toHaveBeenCalledOnce();
  });

  it("retains selection and values during loading, ignores stale failures, and retries", async () => {
    let reject!: (error: Error) => void;
    const load = vi.fn(
      () =>
        new Promise<EditorI18nResources>((_, fail) => {
          reject = fail;
        })
    );
    const runtime = createEditorI18n({ locales, resourceLoaders: [{ locale: "nl", load }] });
    const pending = runtime.setLocale("nl");
    await vi.waitFor(() => expect(load).toHaveBeenCalledOnce());
    expect(runtime.getSnapshot()).toMatchObject({ locale: "en-GB", loading: true });
    expect(runtime.translate("editor-api")("fields.label")).toBe("Label");
    await runtime.setLocale("en-GB");
    reject(new Error("Obsolete download"));
    await pending;
    expect(runtime.getSnapshot()).toMatchObject({ locale: "en-GB", loading: false, error: null });
    load.mockRejectedValueOnce(new Error("offline"));
    await expect(runtime.setLocale("nl")).rejects.toThrow("offline");
    expect(runtime.getSnapshot()).toMatchObject({ locale: "en-GB", loading: false });
    load.mockResolvedValueOnce(bundle);
    await runtime.select({ locale: "nl", profile: "plain" });
    expect(runtime.translate("editor-api")("fields.label")).toBe("Specifiek");
  });

  it("validates all layers before commit, rejects cross-locale writes and evicts invalid bundles", async () => {
    const load = vi.fn(async (): Promise<EditorI18nResources> => ({
      catalogs: { "en-GB": { "editor-api": { fields: { label: "Wrong locale" } } } },
    }));
    const runtime = createEditorI18n({ locales, resourceLoaders: [{ locale: "nl", load }] });
    await expect(runtime.setLocale("nl")).rejects.toThrow("only supply nl");
    load.mockResolvedValueOnce({ profiles: { unused: { nl: { common: { unknown: "Wrong key" } } } } });
    await expect(runtime.setLocale("nl")).rejects.toThrow();
    expect(runtime.getSnapshot().locale).toBe("en-GB");
    load.mockResolvedValueOnce({ catalogs });
    await runtime.setLocale("nl");
    // The cached snapshot is isolated from later mutation of loader-owned objects.
    catalogs.nl["editor-api"].fields.label = "Mutated";
    await runtime.setProfile("plain");
    expect(runtime.translate("editor-api")("fields.label")).toBe("Basis");
    catalogs.nl["editor-api"].fields.label = "Basis";
  });

  it("keeps synchronous overrides and host precedence, without sharing selection between runtimes", async () => {
    const loader = { locale: "nl", load: async () => bundle };
    const first = createEditorI18n({
      locales,
      resourceLoaders: [loader],
      profiles: { plain: { nl: { "editor-api": { fields: { label: "Override" } } } } },
      host: { nl: { "editor-api": { fields: { label: "Host" } } } },
    });
    const second = createEditorI18n({ locales, resourceLoaders: [loader] });
    await first.select({ locale: "nl", profile: "plain" });
    expect(first.translate("editor-api")("fields.label")).toBe("Host");
    expect(second.getSnapshot().locale).toBe("en-GB");
  });
});
