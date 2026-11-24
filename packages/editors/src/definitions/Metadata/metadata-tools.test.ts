import { describe, expect, test, vi } from "vitest";
import {
  canConvertToRequiredStatement,
  clearSourceManifestCache,
  describeSourceMetadata,
  describeUniqueSourceMetadata,
  extractSourceMetadataGroups,
  getMissingMetadataTemplates,
  getSourceManifestRefs,
  loadSourceManifest,
  metadataItemToRequiredStatement,
  resolveRequiredStatementConversion,
  specificationMetadataTemplates,
} from "./metadata-tools";

const item = (label: string, value: string, lang = "en") => ({
  label: { [lang]: [label] },
  value: { [lang]: [value] },
});

describe("required statement conversion", () => {
  test("offers conversion only for labels matching the keywords", () => {
    expect(canConvertToRequiredStatement(item("Attribution", "Leeds Library"))).toBe(true);
    expect(canConvertToRequiredStatement(item("Credit line", "Leeds Library"))).toBe(true);
    expect(canConvertToRequiredStatement(item("Date", "1900"))).toBe(false);
    // Whole word matches only.
    expect(canConvertToRequiredStatement(item("Discredited", "x"))).toBe(false);
  });

  test("does not offer conversion for empty values", () => {
    expect(canConvertToRequiredStatement(item("Attribution", "  "))).toBe(false);
  });

  test("can be turned off, and explicit false is preserved", () => {
    expect(canConvertToRequiredStatement(item("Attribution", "x"), { enabled: false })).toBe(false);
    expect(resolveRequiredStatementConversion({ enabled: false }).enabled).toBe(false);
    expect(resolveRequiredStatementConversion({}).enabled).toBe(true);
  });

  test("uses configured keywords, and an empty list matches nothing", () => {
    expect(canConvertToRequiredStatement(item("Provenance", "x"), { keywords: ["provenance"] })).toBe(true);
    expect(canConvertToRequiredStatement(item("Attribution", "x"), { keywords: ["provenance"] })).toBe(false);
    expect(canConvertToRequiredStatement(item("Attribution", "x"), { keywords: [] })).toBe(false);
  });

  test("converts to a detached required statement", () => {
    const source = item("Attribution", "Leeds");
    const statement = metadataItemToRequiredStatement(source);
    expect(statement).toEqual(source);
    expect(statement.label).not.toBe(source.label);
  });
});

describe("metadata templates", () => {
  test("only suggests templates whose label is missing", () => {
    const missing = getMissingMetadataTemplates(
      [item("Date", ""), item("Creator", ""), item("creator", "")],
      [item("date", "1900")]
    );
    expect(missing.map((m) => m.label.en![0])).toEqual(["Creator"]);
  });

  test("reads metadata-template specification rules for the entity type", () => {
    const specs = [
      {
        rules: [
          { type: "iiif:metadata-template", entityType: "Canvas", items: [{ label: "Photographer", value: "Anon" }] },
          { type: "iiif:metadata-template", items: [{ label: { en: ["Collection"] } }] },
          { type: "other", entityType: "Canvas" },
        ],
      },
    ];
    expect(specificationMetadataTemplates(specs, "Canvas", "en")).toEqual([
      { label: { en: ["Photographer"] }, value: { en: ["Anon"] } },
    ]);
    expect(specificationMetadataTemplates(specs, "Manifest", "en")).toEqual([
      { label: { en: ["Collection"] }, value: { en: [""] } },
    ]);
  });
});

describe("source metadata recovery", () => {
  test("identifies source manifests by id even when the parser reports ContentResource", () => {
    expect(
      getSourceManifestRefs([
        { id: "https://example.org/manifest", type: "ContentResource", label: { en: ["Source"] } },
        { id: "https://example.org/manifest", type: "Manifest" },
        { id: "https://example.org/canvas/1", type: "Canvas" },
        { id: "urn:not-fetchable", type: "Manifest" },
      ])
    ).toEqual([{ id: "https://example.org/manifest", label: { en: ["Source"] } }]);
  });

  const source = {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { en: ["Source"] },
    metadata: [item("Date", "1900"), item("Creator", "Someone")],
    items: [{ id: "https://example.org/canvas/1", type: "Canvas", metadata: [item("Page", "1")] }],
  };

  test("extracts manifest metadata and matching source canvas metadata", () => {
    const groups = extractSourceMetadataGroups(source, {
      id: "https://example.org/canvas/1#xywh=0,0,1,1",
      type: "Canvas",
    });
    expect(groups.map((g) => [g.kind, g.items.length])).toEqual([
      ["manifest", 2],
      ["canvas", 1],
    ]);
    expect(extractSourceMetadataGroups(source, { id: "urn:m", type: "Manifest" }).map((g) => g.kind)).toEqual([
      "manifest",
    ]);
  });

  test("ignores loaded resources that are not manifests", () => {
    expect(extractSourceMetadataGroups({ ...source, type: "Collection" }, { id: "x", type: "Manifest" })).toEqual([]);
    expect(extractSourceMetadataGroups(null, { id: "x", type: "Manifest" })).toEqual([]);
  });

  test("marks removed values as missing so they can be re-added", () => {
    const [group] = extractSourceMetadataGroups(source, { id: "urn:m", type: "Manifest" });
    const rows = describeSourceMetadata(group!, [item("Date", "1900")]);
    expect(rows.map((r) => r.present)).toEqual([true, false]);
  });

  test("loads the full original manifest once and does not cache failures", async () => {
    clearSourceManifestCache();
    const response = (ok: boolean) => ({ ok, status: ok ? 200 : 500, json: async () => source });
    const fetchSpy = vi.fn().mockResolvedValueOnce(response(false)).mockResolvedValue(response(true));
    vi.stubGlobal("fetch", fetchSpy);
    try {
      await expect(loadSourceManifest("https://example.org/manifest")).rejects.toThrow();
      await expect(loadSourceManifest("https://example.org/manifest")).resolves.toEqual(source);
      await loadSourceManifest("https://example.org/manifest");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("describeUniqueSourceMetadata", () => {
  const group = (id: string, items: ReturnType<typeof item>[]) =>
    ({ id, kind: "manifest", sourceId: id, label: null, items }) as any;

  test("counts duplicates across groups once and tracks presence", () => {
    const groups = [
      group("a", [item("Date", "1900"), item("Author", "Ada")]),
      group("b", [item("Date", "1900"), item("Place", "Leeds")]),
    ];
    const rows = describeUniqueSourceMetadata(groups, [item("Author", "Ada")]);
    expect(rows.map((r) => [r.item.label.en![0], r.present])).toEqual([
      ["Date", false],
      ["Author", true],
      ["Place", false],
    ]);
    expect(describeUniqueSourceMetadata(groups, [item("Date", "1900")]).filter((r) => !r.present)).toHaveLength(2);
  });
});
