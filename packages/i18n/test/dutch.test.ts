import { expect, it } from "vitest";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchExhibition, dutchExhibitionPlain, dutchPlain } from "@manifest-editor/i18n/nl";

const options = {
  locales: [...defaultLocales, dutchLocale],
  catalogs: dutchCatalogs,
  profiles: { plain: dutchPlain },
  config: { defaultLocale: "nl" },
};

it("enables complete Dutch catalogs explicitly and switches wording without retaining old overlays", async () => {
  const runtime = createEditorI18n(options);
  expect(runtime.getSnapshot().coverage).toEqual({ complete: true, missing: [] });
  expect(runtime.translate("common")("actions.save")).toBe("Opslaan");
  await runtime.setProfile("plain");
  expect(runtime.translate("editors")("canvas.count", { count: 2 })).toBe("2 pagina's");
  await runtime.setProfile("standard");
  expect(runtime.translate("editors")("canvas.count", { count: 2 })).toBe("2 canvassen");
  await runtime.setLocale("en-GB");
  expect(runtime.translate("common")("actions.save")).toBe("Save");
});

it("composes the Dutch exhibition and plain intersection explicitly", async () => {
  const runtime = createEditorI18n({
    ...options,
    presets: [dutchExhibition],
    presetProfiles: { plain: dutchExhibitionPlain },
  });
  expect(runtime.translate("editors")("canvas.add")).toBe("Dia toevoegen");
  await runtime.setProfile("plain");
  expect(runtime.translate("editors")("canvas.count", { count: 2 })).toBe("2 dia's");
  expect(runtime.translate("editors")("fields.label")).toBe("Titel");
  expect(runtime.getSnapshot().coverage.complete).toBe(true);
});
