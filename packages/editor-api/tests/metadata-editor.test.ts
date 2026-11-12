import { describe, expect, test } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { Editor } from "../src/Editor";

function setup() {
  const vault = new Vault();
  const manifestId = "https://example.org/manifest";
  const canvasId = "https://example.org/canvas";
  vault.loadManifestSync(manifestId, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestId,
    type: "Manifest",
    label: { en: ["Exhibition"] },
    metadata: [],
    items: [{ id: canvasId, type: "Canvas", width: 100, height: 100, items: [], metadata: [] }],
  });
  return { vault, editor: new Editor(vault), manifestId, canvasId };
}

describe("MetadataEditor.add", () => {
  test.each(["Manifest", "Canvas"] as const)("preserves distinct source labels and multilingual values on a %s", (type) => {
    const { vault, editor, manifestId, canvasId } = setup();
    const ref = { id: type === "Manifest" ? manifestId : canvasId, type };
    const metadata = editor.edit(ref).descriptive.metadata;
    const label = { en: ["Creator"], fr: ["Créateur"] };
    const value = { en: ["A. Painter"], fr: ["Un peintre"] };

    metadata.add(label, value);

    expect(vault.get(ref).metadata).toEqual([{ label, value }]);
    expect(metadata.getWithoutTracking()).toEqual([{ label, value }]);
  });

  test("retains existing rows and inserts new source metadata at the requested position", () => {
    const { editor, manifestId } = setup();
    const metadata = editor.edit({ id: manifestId, type: "Manifest" }).descriptive.metadata;
    const first = { label: { en: ["Title"] }, value: { en: ["The painting"] } };
    const last = { label: { en: ["Date"] }, value: { en: ["1900"] } };
    const inserted = { label: { en: ["Credit"] }, value: { en: ["Leeds Library"] } };
    metadata.add(first.label, first.value);
    metadata.add(last.label, last.value);
    metadata.add(inserted.label, inserted.value, 1);

    expect(metadata.getWithoutTracking()).toEqual([first, inserted, last]);
  });

  test("keeps template values empty instead of copying their label", () => {
    const { editor, canvasId } = setup();
    const metadata = editor.edit({ id: canvasId, type: "Canvas" }).descriptive.metadata;
    metadata.add({ en: ["Photographer"] }, { en: [""] });

    expect(metadata.getWithoutTracking()).toEqual([
      { label: { en: ["Photographer"] }, value: { en: [""] } },
    ]);
  });
});
