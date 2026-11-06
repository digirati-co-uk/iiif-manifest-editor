import { describe, expect, test } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { Editor } from "../src/Editor";
import {
  canvasLayouts,
  canvasSizePresets,
  type CanvasLayout,
  type CanvasSizePreset,
} from "../src/canvas-layout/geometry";
import { supportedBehaviorConfig, type BehaviorChoice } from "../src/meta/behavior";
import { documentation, type DocDefinition } from "../src/meta/documentation";
import { propertyLabels, resourceLabels } from "../src/meta/labels";
import { creativeCommons, type CCDefinition } from "../src/meta/rights";
import type { DisplayMessageReference } from "../src/meta/display";
import { resources } from "../src/meta/resources";
import { createEditorI18n, defaultLocales, dutchLocale } from "../../i18n/src/runtime";
import { dutchPlain } from "../../i18n/src/nl";
import type { MessageReference } from "../../i18n/src/types";
import { catalog as en } from "../../../internal-packages/languages/src/locales/en-GB/editor-api";
import { catalog as nl } from "../../../internal-packages/languages/src/locales/nl/editor-api";
import { createCatalogContract, validateCatalog } from "../../../internal-packages/languages/src/validation";
import { flattenCatalog } from "../../../internal-packages/languages/src/schema";

function runtime() {
  return createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    config: { availableLocales: ["en-GB", "nl"] },
    catalogs: { "en-GB": { "editor-api": en }, nl: { "editor-api": nl } },
    profiles: { plain: dutchPlain },
    requiredNamespaces: ["editor-api"],
  });
}

const docs = [
  documentation.definedTypes,
  documentation.descriptive,
  documentation.technical,
  documentation.linking,
  documentation.structural,
];
const choices = [...new Set(Object.values(supportedBehaviorConfig).flat())];

// This assignment verifies compatibility without adding an i18n dependency to editor-api.
const publicReference: MessageReference = resourceLabels.Canvas.labelMessage;

describe("deferred system display metadata", () => {
  test("both complete catalogs satisfy keys, placeholders, rich text and plural contracts", () => {
    const contract = createCatalogContract(en);
    expect(validateCatalog(en, contract, { locale: "en-GB", complete: true })).toEqual([]);
    expect(validateCatalog(nl, contract, { locale: "nl", complete: true })).toEqual([]);
    expect([...flattenCatalog(nl).keys()].sort()).toEqual([...flattenCatalog(en).keys()].sort());
    expect([...flattenCatalog(en).keys()]).toHaveLength(147);
  });

  test("every definition has serialisable metadata resolving to its full source copy", () => {
    const i18n = runtime();
    function check(reference: DisplayMessageReference | undefined, fallback: string) {
      expect(reference?.namespace).toBe("editor-api");
      expect(JSON.parse(JSON.stringify(reference))).toEqual(reference);
      expect(i18n.resolveMessage(reference)).toBe(fallback);
    }
    for (const section of docs) for (const entry of Object.values(section)) check(entry.summaryMessage, entry.summary);
    check(documentation.attributionMessage, documentation.attribution);
    for (const entry of [
      ...canvasLayouts,
      ...canvasSizePresets,
      ...Object.values(propertyLabels),
      ...Object.values(resourceLabels),
    ])
      check(entry.labelMessage, entry.label);
    for (const entry of creativeCommons) {
      check(entry.labelMessage, entry.label);
      check(entry.descriptionMessage, entry.description);
    }
    const flat = flattenCatalog(en);
    for (const choice of choices) {
      check(choice.labelMessage, choice.label.en![0]!);
      for (const item of choice.items) {
        expect(item.label).toEqual({ none: [item.value] });
        check(item.labelMessage, flat.get(`behavior.values.${item.value}`)!);
      }
    }
    for (const type of resources.all) {
      expect(resourceLabels[type].labelMessage).toBeDefined();
      for (const property of resources.getSupported(type).all) expect(propertyLabels).toHaveProperty(property);
    }
  });

  test("locale changes resolve static metadata again without changing authored content or editing payloads", async () => {
    const vault = new Vault();
    const id = "https://example.org/manifest";
    await vault.loadManifest(id, {
      id,
      type: "Manifest",
      label: { cy: ["Teitl"], nl: ["Eigen titel"] },
      summary: { en: ["Authored summary"] },
      behavior: ["paged"],
      rights: "http://creativecommons.org/licenses/by/4.0/",
      items: [],
    });
    const editor = new Editor(vault).edit({ id, type: "Manifest" });
    editor.descriptive.summary.set({ fr: ["Résumé modifié"] });
    const before = vault.toPresentation3({ id, type: "Manifest" });
    const i18n = runtime();
    expect(i18n.resolveMessage(canvasLayouts[0]!.labelMessage)).toBe("Side by side");
    await i18n.setLocale("nl");
    expect(i18n.resolveMessage(canvasLayouts[0]!.labelMessage)).toBe("Naast elkaar");
    expect(i18n.resolveMessage(publicReference)).toBe("Canvas");
    expect(i18n.resolveMessage(supportedBehaviorConfig.Manifest[0]!.labelMessage)).toBe("Volgorde van het manifest");
    expect(i18n.resolveMessage(documentation.descriptive.navDate.summaryMessage)).toBe(
      nl.documentation.descriptive.navDate
    );
    expect(i18n.resolveMessage(creativeCommons[1]!.descriptionMessage)).toBe(nl.rights.attribution.description);
    await i18n.setProfile("plain");
    expect(i18n.resolveMessage(resourceLabels.Canvas.labelMessage)).toBe("Pagina");
    expect(i18n.resolveMessage(resourceLabels.Range.labelMessage)).toBe("Sectie");
    expect(i18n.resolveMessage(propertyLabels.label.labelMessage)).toBe("Titel");
    expect(i18n.resolveMessage(canvasLayouts.find((layout) => layout.id === "blank")!.labelMessage)).toBe(
      "Lege pagina"
    );
    await i18n.setLocale("en-GB");
    expect(i18n.resolveMessage(resourceLabels.Canvas.labelMessage)).toBe("Page");
    expect(i18n.resolveMessage(propertyLabels.navDate.labelMessage)).toBe("Date for sorting");
    await i18n.setProfile("standard");
    expect(i18n.resolveMessage(resourceLabels.Canvas.labelMessage)).toBe("Canvas");
    expect(editor.technical.behavior.get()).toEqual(["paged"]);
    expect(editor.descriptive.rights.getDefinition()).toBe(creativeCommons[1]);
    expect(vault.toPresentation3({ id, type: "Manifest" })).toEqual(before);
    editor.technical.behavior.set(["continuous"]);
    expect(editor.technical.behavior.get()).toEqual(["continuous"]);
    expect(editor.descriptive.label.get()).toEqual({ cy: ["Teitl"], nl: ["Eigen titel"] });
  });

  test("legacy third-party definitions remain valid without references", () => {
    const doc: DocDefinition = { link: "https://example.org", summary: "Custom documentation" };
    const layout: CanvasLayout = { id: "custom", label: "Custom", slots: [] };
    const size: CanvasSizePreset = { label: "Custom", columns: 3, rows: 5 };
    const choice: BehaviorChoice = {
      id: "custom",
      label: { none: ["Custom"] },
      type: "choice",
      items: [{ value: "custom", label: { cy: ["Dewis"] } }],
    };
    const rights: CCDefinition = {
      label: "Custom",
      shortLabel: "C",
      description: "Custom",
      icon: "",
      value: "",
      url: "",
      legal: "",
    };
    const i18n = runtime();
    for (const entry of [layout, size, rights])
      expect(i18n.resolveMessage(entry.labelMessage, entry.label)).toBe("Custom");
    expect(i18n.resolveMessage(doc.summaryMessage, doc.summary)).toBe("Custom documentation");
    expect(choice.items[0]!.label).toEqual({ cy: ["Dewis"] });
  });
});
