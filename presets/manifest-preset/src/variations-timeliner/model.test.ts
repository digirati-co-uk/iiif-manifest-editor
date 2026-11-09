import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import {
  moveBoundary,
  addMarker,
  getMarkers,
  removeMarker,
  consolidateMarkerPages,
  markerPageId,
  addSection,
  canGroup,
  getBubbles,
  groupSections,
  removeSection,
  splitSection,
  bubbleRows,
  largestGap,
  setSectionColour,
  setSectionTimes,
  validateSectionTimes,
} from "./model";

const manifestId = "https://example.org/manifest";
const canvasId = "https://example.org/canvas";
async function setup(structures: any[] = []) {
  const vault = new Vault();
  await vault.loadManifest(manifestId, {
    id: manifestId,
    type: "Manifest",
    label: { en: ["Music"] },
    items: [{ id: canvasId, type: "Canvas", duration: 100, items: [] }],
    structures,
  });
  const manifest = () => vault.get({ id: manifestId, type: "Manifest" });
  const bubbles = () => getBubbles(vault, manifest(), canvasId);
  return { vault, manifest, bubbles };
}
const range = (id: string, start: number, end: number) => ({
  id: `https://example.org/${id}`,
  type: "Range",
  label: { en: [id] },
  items: [{ id: `${canvasId}#t=${start},${end}`, type: "Canvas" }],
});

describe("Variations Timeliner Vault adapter", () => {
  test("loads Timeliner fragment ranges and derives nested group extents", async () => {
    const { bubbles } = await setup([
      {
        id: "https://example.org/group",
        type: "Range",
        label: { en: ["Group"] },
        items: [range("a", 0, 40), range("b", 40, 100)],
      },
    ]);
    expect(bubbles().map(({ title, start, end, height }) => ({ title, start, end, height }))).toEqual([
      { title: "a", start: 0, end: 40, height: 1 },
      { title: "b", start: 40, end: 100, height: 1 },
      { title: "Group", start: 0, end: 100, height: 2 },
    ]);
  });
  test("creates, splits, groups, ungroups and serializes through Vault", async () => {
    const { vault, manifest, bubbles } = await setup();
    addSection(vault, manifest(), canvasId, 100);
    expect(bubbles()).toHaveLength(1);
    splitSection(vault, bubbles()[0]!, canvasId, 40);
    expect(bubbles().map((b) => [b.start, b.end])).toEqual([
      [0, 40],
      [40, 100],
    ]);
    const groupId = groupSections(vault, bubbles());
    expect(groupId).toBeTruthy();
    const group = bubbles().find((b) => b.id === groupId)!;
    expect(group.children).toHaveLength(2);
    const json = vault.toPresentation3({ id: manifestId, type: "Manifest" }) as any;
    expect(json.structures[0].items).toHaveLength(2);
    expect(json.structures[0].items[0].items[0].id).toBe(`${canvasId}#t=0,40`);
    removeSection(vault, group);
    expect(bubbles()).toHaveLength(2);
    expect((manifest() as any).structures).toHaveLength(2);
  });
  test("rejects boundary splits and noncontiguous groups without losing data", async () => {
    const { vault, bubbles } = await setup([range("a", 0, 30), range("b", 30, 60), range("c", 60, 100)]);
    expect(splitSection(vault, bubbles()[0]!, canvasId, 0)).toBeNull();
    expect(splitSection(vault, bubbles()[0]!, canvasId, 30)).toBeNull();
    expect(canGroup([bubbles()[0]!, bubbles()[2]!])).toBe(false);
    expect(groupSections(vault, [bubbles()[0]!, bubbles()[2]!])).toBeNull();
    expect(bubbles()).toHaveLength(3);
  });
  test("does not split groups or ranges with additional targets", async () => {
    const multi = range("multi", 0, 40);
    multi.items.push({ id: `${canvasId}#t=60,100`, type: "Canvas" });
    const { vault, bubbles } = await setup([multi]);
    expect(splitSection(vault, bubbles()[0]!, canvasId, 20)).toBeNull();
    expect(bubbles()).toHaveLength(1);
  });
  test("ignores ranges from other canvases and guards cyclic hierarchies", async () => {
    const { vault, manifest, bubbles } = await setup([range("a", 0, 40)]);
    const a = bubbles()[0]!;
    vault.modifyEntityField({ id: a.id, type: "Range" }, "items", [{ id: a.id, type: "Range" }]);
    expect(getBubbles(vault, manifest(), canvasId)).toEqual([]);
    expect(getBubbles(vault, manifest(), "other")).toEqual([]);
  });
});

describe("markers and shared boundaries", () => {
  test("stores markers in IIIF annotations and keeps them canvas-specific", async () => {
    const { vault, manifest } = await setup();
    addMarker(vault, manifest(), canvasId, 12.5);
    const markers = getMarkers(vault, manifest(), canvasId);
    expect(markers).toHaveLength(1);
    expect(markers[0]!.time).toBe(12.5);
    expect(getMarkers(vault, manifest(), "other")).toHaveLength(0);
    const json = vault.toPresentation3({ id: manifestId, type: "Manifest" }) as any;
    expect(json.annotations[0].items[0].target.selector).toEqual({ type: "PointSelector", t: 12.5 });
    removeMarker(vault, markers[0]!);
    expect(getMarkers(vault, manifest(), canvasId)).toHaveLength(0);
  });
  test("puts every marker in one shared annotation page", async () => {
    const { vault, manifest } = await setup();
    addMarker(vault, manifest(), canvasId, 5);
    addMarker(vault, manifest(), canvasId, 20);
    addMarker(vault, manifest(), canvasId, 10);
    const json = vault.toPresentation3({ id: manifestId, type: "Manifest" }) as any;
    expect(json.annotations).toHaveLength(1);
    expect(json.annotations[0].id).toBe(markerPageId(manifestId));
    expect(json.annotations[0].items.map((item: any) => item.target.selector.t)).toEqual([5, 20, 10]);
    expect(getMarkers(vault, manifest(), canvasId).map((m) => m.time)).toEqual([5, 10, 20]);
    // Removing every marker keeps the page, so the next marker reuses it rather than adding another.
    getMarkers(vault, manifest(), canvasId).forEach((m) => removeMarker(vault, m));
    addMarker(vault, manifest(), canvasId, 7);
    expect((vault.toPresentation3({ id: manifestId, type: "Manifest" }) as any).annotations).toHaveLength(1);
  });
  test("detects an existing annotation page with point selectors and adds to it", async () => {
    const pointPage = (id: string, ...times: number[]) => ({
      id,
      type: "AnnotationPage",
      items: times.map((t, i) => ({
        id: `${id}/a${i}`,
        type: "Annotation",
        motivation: "commenting",
        label: { en: [`Existing ${t}`] },
        body: { type: "TextualBody", value: "" },
        target: { type: "SpecificResource", source: canvasId, selector: { type: "PointSelector", t } },
      })),
    });
    const vault = new Vault();
    await vault.loadManifest(manifestId, {
      id: manifestId,
      type: "Manifest",
      label: { en: ["Music"] },
      items: [
        {
          id: canvasId,
          type: "Canvas",
          duration: 100,
          items: [],
          annotations: [pointPage("https://example.org/canvas-page", 3)],
        },
      ],
      annotations: [
        { id: "https://example.org/other-page", type: "AnnotationPage", items: [] },
        pointPage("https://example.org/old-markers", 1, 2),
      ],
    });
    const manifest = () => vault.get({ id: manifestId, type: "Manifest" });
    expect(getMarkers(vault, manifest(), canvasId).map((m) => m.time)).toEqual([1, 2, 3]);
    addMarker(vault, manifest(), canvasId, 50);
    const json = vault.toPresentation3({ id: manifestId, type: "Manifest" }) as any;
    // No new page: the marker joined the page that already had point selectors, the empty page is untouched.
    expect(json.annotations.map((page: any) => page.id)).toEqual([
      "https://example.org/other-page",
      "https://example.org/old-markers",
    ]);
    expect(json.annotations[1].items.map((item: any) => item.target.selector.t)).toEqual([1, 2, 50]);
  });
  test("merges one-marker-per-page data left by earlier versions", async () => {
    const page = (n: number) => ({
      id: `https://example.org/legacy/${n}/page`,
      type: "AnnotationPage",
      items: [
        {
          id: `https://example.org/legacy/${n}`,
          type: "Annotation",
          motivation: "commenting",
          label: { en: [`Marker ${n}`] },
          body: { type: "TextualBody", value: "" },
          target: { type: "SpecificResource", source: canvasId, selector: { type: "PointSelector", t: n } },
        },
      ],
    });
    const vault = new Vault();
    await vault.loadManifest(manifestId, {
      id: manifestId,
      type: "Manifest",
      label: { en: ["Music"] },
      items: [{ id: canvasId, type: "Canvas", duration: 100, items: [] }],
      annotations: [page(1), page(2), page(3)],
    });
    const manifest = () => vault.get({ id: manifestId, type: "Manifest" });
    consolidateMarkerPages(vault, manifest(), canvasId);
    const json = vault.toPresentation3({ id: manifestId, type: "Manifest" }) as any;
    expect(json.annotations).toHaveLength(1);
    expect(json.annotations[0].items.map((item: any) => item.label.en[0])).toEqual([
      "Marker 1",
      "Marker 2",
      "Marker 3",
    ]);
  });
  test("moves shared boundaries and prevents inverted sections", async () => {
    const { vault, bubbles } = await setup([range("a", 0, 40), range("b", 40, 100)]);
    moveBoundary(vault, bubbles(), canvasId, 40, 50, 100);
    expect(bubbles().map((b) => [b.start, b.end])).toEqual([
      [0, 50],
      [50, 100],
    ]);
    moveBoundary(vault, bubbles(), canvasId, 50, 150, 100);
    expect(bubbles()[1]!.start).toBeLessThan(100);
    expect(bubbles()[0]!.end).toBe(bubbles()[1]!.start);
  });

  test("lists nested sections depth-first for the sidebar", async () => {
    const { bubbles } = await setup([
      {
        id: "https://example.org/group",
        type: "Range",
        label: { en: ["Group"] },
        items: [range("a", 0, 40), range("b", 40, 100)],
      },
      range("c", 0, 10),
    ]);
    expect(bubbleRows(bubbles()).map(({ bubble, level }) => [bubble.title, level])).toEqual([
      ["Group", 0],
      ["a", 1],
      ["b", 1],
      ["c", 0],
    ]);
  });

  test("finds the largest uncovered stretch for adding another section", async () => {
    const { vault, manifest, bubbles } = await setup([range("a", 10, 30), range("b", 40, 45)]);
    expect(largestGap(bubbles(), 100)).toEqual({ start: 45, end: 100 });
    expect(largestGap(bubbles(), 45)).toEqual({ start: 0, end: 10 });
    expect(largestGap([], 100)).toEqual({ start: 0, end: 100 });
    const id = addSection(vault, manifest(), canvasId, 100, { start: 45, end: 100, label: "Rest" });
    expect(bubbles().find((b) => b.id === id)).toMatchObject({ title: "Rest", start: 45, end: 100 });
    expect(addSection(vault, manifest(), canvasId, 100, { start: 50, end: 150 })).toBeNull();
  });

  test("validates and applies edited section times", async () => {
    const { vault, bubbles } = await setup([range("a", 0, 100)]);
    expect(validateSectionTimes(10, 5, 100)).toMatch(/after/);
    expect(validateSectionTimes(-1, 5, 100)).toMatch(/within/);
    expect(validateSectionTimes(NaN, 5, 100)).toMatch(/Enter/);
    expect(setSectionTimes(vault, bubbles()[0]!.id, canvasId, 10, 5, 100)).toBe(false);
    expect(setSectionTimes(vault, bubbles()[0]!.id, canvasId, 10, 60, 100)).toBe(true);
    expect(bubbles()[0]).toMatchObject({ start: 10, end: 60 });
  });

  test("keeps custom colours in exported metadata, alongside other metadata", async () => {
    const { vault, manifest, bubbles } = await setup([
      { ...range("a", 0, 100), metadata: [{ label: { en: ["Composer"] }, value: { en: ["Chopin"] } }] },
    ]);
    const id = bubbles()[0]!.id;
    const exported = () => (vault.toPresentation3(manifest()) as any).structures[0];
    setSectionColour(vault, id, "#112233");
    expect(bubbles()[0]!.colour).toBe("#112233");
    expect(exported().metadata).toHaveLength(2);
    setSectionColour(vault, id, "#445566");
    expect(exported().metadata).toHaveLength(2);
    expect(exported().metadata[1].value.none).toEqual(["#445566"]);
    setSectionColour(vault, id, null);
    expect(bubbles()[0]!.colour).toBeUndefined();
    expect(exported().metadata).toEqual([{ label: { en: ["Composer"] }, value: { en: ["Chopin"] } }]);
  });
});
