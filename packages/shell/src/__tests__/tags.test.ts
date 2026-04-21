import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import {
  addResourceTag,
  createManifestEditorTagsApi,
  FLAG_TAG,
  getResourceTags,
  getResourceTagsFromState,
  hasResourceTag,
  removeResourceTag,
  setResourceTags,
  TAGS_META_NAMESPACE,
  toggleResourceTag,
  type ManifestEditorTag,
} from "../Tags";

const manifestRef = { id: "https://example.org/manifest", type: "Manifest" };
const canvasRef = { id: "https://example.org/canvas/1", type: "Canvas" };

const reviewTag: ManifestEditorTag = {
  type: "review",
  id: "review",
  label: "Review",
  backgroundColor: "#111827",
  textColor: "#ffffff",
};

const approvedTag: ManifestEditorTag = {
  type: "approval",
  id: "approved",
  label: "Approved",
  backgroundColor: "#166534",
  textColor: "#ffffff",
};

const handwrittenTag: ManifestEditorTag = {
  type: "text-form",
  id: "handwritten",
  label: "Handwritten",
  backgroundColor: "#3730a3",
  textColor: "#ffffff",
};

const printedTag: ManifestEditorTag = {
  type: "text-form",
  id: "printed",
  label: "Printed",
  backgroundColor: "#0f766e",
  textColor: "#ffffff",
};

function createVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    ...manifestRef,
    label: { en: ["Test manifest"] },
    items: [
      {
        ...canvasRef,
        label: { en: ["Canvas 1"] },
        height: 100,
        width: 100,
        items: [],
      },
    ],
  });
  return vault;
}

describe("manifest editor tags", () => {
  test("sets, adds, and removes tags on Manifest and Canvas resources", () => {
    const vault = createVault();

    setResourceTags(vault, manifestRef, [reviewTag]);
    addResourceTag(vault, manifestRef, approvedTag);
    addResourceTag(vault, canvasRef, FLAG_TAG);

    expect(getResourceTags(vault, manifestRef)).toEqual([reviewTag, approvedTag]);
    expect(getResourceTags(vault, canvasRef)).toEqual([FLAG_TAG]);

    removeResourceTag(vault, manifestRef, reviewTag.type);

    expect(getResourceTags(vault, manifestRef)).toEqual([approvedTag]);
    expect(getResourceTags(vault, canvasRef)).toEqual([FLAG_TAG]);
  });

  test("upserts duplicate tag types", () => {
    const vault = createVault();

    setResourceTags(vault, manifestRef, [handwrittenTag, printedTag]);

    expect(getResourceTags(vault, manifestRef)).toEqual([printedTag]);
  });

  test("replaces an existing tag with the same type when adding", () => {
    const vault = createVault();

    addResourceTag(vault, canvasRef, handwrittenTag);
    addResourceTag(vault, canvasRef, printedTag);

    expect(getResourceTags(vault, canvasRef)).toEqual([printedTag]);
  });

  test("creates a tags api bound to a vault", () => {
    const vault = createVault();
    const tags = createManifestEditorTagsApi(vault);

    tags.addTag(canvasRef, handwrittenTag);

    expect(tags.getTags(canvasRef)).toEqual([handwrittenTag]);
    expect(tags.hasTag(canvasRef, handwrittenTag.type, handwrittenTag.id)).toBe(true);

    tags.upsertTag(canvasRef, printedTag);

    expect(tags.getTag(canvasRef, printedTag.type)).toEqual(printedTag);

    tags.removeTag(canvasRef, printedTag.type);

    expect(tags.getTags(canvasRef)).toEqual([]);
  });

  test("toggles the built-in flag tag", () => {
    const vault = createVault();

    expect(hasResourceTag(vault, canvasRef, FLAG_TAG.type, FLAG_TAG.id)).toBe(false);

    toggleResourceTag(vault, canvasRef, FLAG_TAG);

    expect(hasResourceTag(vault, canvasRef, FLAG_TAG.type, FLAG_TAG.id)).toBe(true);

    toggleResourceTag(vault, canvasRef, FLAG_TAG);

    expect(hasResourceTag(vault, canvasRef, FLAG_TAG.type, FLAG_TAG.id)).toBe(false);
  });

  test("stores tag data in Vault meta without serialising it to Presentation 3", () => {
    const vault = createVault();

    setResourceTags(vault, manifestRef, [reviewTag]);
    setResourceTags(vault, canvasRef, [FLAG_TAG]);

    expect(vault.getResourceMeta(manifestRef.id, TAGS_META_NAMESPACE)).toEqual({ tags: [reviewTag] });
    expect(vault.getResourceMeta(canvasRef.id, TAGS_META_NAMESPACE)).toEqual({ tags: [FLAG_TAG] });

    const presentation3 = vault.toPresentation3<any>(manifestRef);
    const serialised = JSON.stringify(presentation3);

    expect(serialised).not.toContain(TAGS_META_NAMESPACE);
    expect(serialised).not.toContain(FLAG_TAG.id);
    expect(serialised).not.toContain(reviewTag.id);
  });

  test("reads tags from vault state for reactive selectors", () => {
    const vault = createVault();

    setResourceTags(vault, manifestRef, [reviewTag]);
    setResourceTags(vault, canvasRef, [FLAG_TAG]);

    expect(getResourceTagsFromState(vault.getState(), manifestRef)).toEqual([reviewTag]);
    expect(getResourceTagsFromState(vault.getState(), canvasRef)).toEqual([FLAG_TAG]);
  });
});
