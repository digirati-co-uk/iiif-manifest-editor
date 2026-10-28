import { expect, it } from "vitest";
import { createEditorI18n } from "@manifest-editor/i18n/core";
import { createWebI18n } from "../src/i18n/WebI18nProvider";
import { createWebUiPolicy } from "../src/i18n/policy";
import { webExhibitionResources, webUiResources } from "../src/i18n/resources";

const added = ["fr", "de", "it", "es", "pt", "ja", "zh", "tr", "fi", "hi", "pl", "uk", "cs", "da", "ms", "ta"];

it("offers all added languages with translated coverage in both wording profiles", async () => {
  const policy = createWebUiPolicy();
  expect(policy.config.availableLocales).toEqual(["en-GB", "nl", ...added]);
  const runtime = createWebI18n({}, policy);
  expect(runtime.getSnapshot().locale).toBe("en-GB");
  for (const locale of added) {
    await runtime.setLocale(locale);
    for (const profile of ["standard", "plain"]) {
      await runtime.setProfile(profile);
      expect(runtime.getSnapshot()).toMatchObject({ locale, profile, coverage: { complete: true } });
      expect(runtime.translate("common")("actions.save")).not.toBe("Save");
    }
  }
  await runtime.select({ locale: "fr", profile: "standard" });
  expect(runtime.translate("editor-api")("fields.label")).toBe("Libellé");
  await runtime.setProfile("plain");
  expect(runtime.translate("editor-api")("fields.label")).toBe("Titre");
  await runtime.setLocale("ja");
  expect(runtime.translate("common")("actions.save")).toBe("保存");
}, 20_000);

it("applies the added exhibition wording while keeping deployment allow-lists effective", async () => {
  const policy = createWebUiPolicy({ availableLocales: ["fr"], availableProfiles: ["standard", "plain"] });
  const runtime = createEditorI18n({ ...policy, ...webUiResources, ...webExhibitionResources });
  expect(runtime.getSnapshot().availableLocales.map(({ id }) => id)).toEqual(["fr"]);
  for (const profile of ["standard", "plain"]) {
    await runtime.setProfile(profile);
    expect(runtime.translate("editors")("canvas.current")).toBe("Diapositive actuelle");
    expect(runtime.getSnapshot().coverage.complete).toBe(true);
  }
  await expect(runtime.setLocale("de")).rejects.toThrow();
});
