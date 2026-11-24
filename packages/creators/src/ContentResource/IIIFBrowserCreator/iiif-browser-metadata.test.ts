import { Editor } from "@manifest-editor/editor-api";
import { describeSourceMetadata, extractSourceMetadataGroups, getSourceManifestRefs, loadSourceManifest } from "../../../../editors/src/definitions/Metadata/metadata-tools";
import { Vault } from "@iiif/helpers";
import type { CreatorFunctionContext } from "@manifest-editor/creator-api";
import { afterEach, expect, test, vi } from "vitest";
import { createFromIIIFBrowserOutput } from "./iiif-browser-creator";

const sourceId = "https://example.org/manifest";
const canvasId = "https://example.org/canvas";
const title = { label: { en: ["Title"] }, value: { en: ["Original title"] } };
const credit = { label: { en: ["Restrictions on use"] }, value: { en: ["Credit the library"] } };
const canvasMetadata = { label: { en: ["Canvas detail"] }, value: { en: ["Keep this"] } };

afterEach(() => vi.unstubAllGlobals());

async function importCanvas(config: Record<string, unknown>, requiredStatement?: typeof credit) {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            id: sourceId,
            type: "Manifest",
            label: { en: ["Source"] },
            metadata: [title, credit],
            items: [
              {
                id: canvasId,
                type: "Canvas",
                width: 100,
                height: 100,
                metadata: [canvasMetadata],
                requiredStatement,
                items: [],
              },
            ],
          }),
          { headers: { "Content-Type": "application/json" } }
        )
    )
  );
  const vault = new Vault();
  const trackManifest = vi.fn();
  await createFromIIIFBrowserOutput(
    {
      output: [{ resource: { id: canvasId, type: "Canvas" }, parent: { id: sourceId, type: "Manifest" } } as any],
      trackManifest,
    },
    {
      config,
      vault,
      options: { targetType: "Canvas" },
      embed: (value: unknown) => value,
    } as CreatorFunctionContext
  );
  return { vault, canvas: vault.get({ id: canvasId, type: "Canvas" }), tracked: trackManifest.mock.calls[0]![0] };
}

test("whole-canvas imports apply filtering and extraction while preserving canvas metadata and provenance", async () => {
  const { canvas, tracked } = await importCanvas({
    manifestMetadataLabels: ["Title"],
    requiredStatementMetadataLabels: ["Restrictions on use"],
  });
  expect(canvas.metadata).toEqual([canvasMetadata, title]);
  expect(canvas.requiredStatement).toEqual(credit);
  expect(canvas.partOf).toContainEqual(expect.objectContaining({ id: sourceId }));
  expect(tracked).toMatchObject({ metadata: [title], requiredStatement: credit });
});

test("disabling manifest metadata import preserves the canvas's own metadata and source link", async () => {
  const { canvas, tracked } = await importCanvas({ addManifestMetadataToCanvas: false });
  expect(canvas.metadata).toEqual([canvasMetadata]);
  expect(canvas.partOf).toContainEqual(expect.objectContaining({ id: sourceId }));
  expect(tracked.metadata).toBeUndefined();
});

test("an existing canvas credit prevents extraction from discarding other source credit metadata", async () => {
  const statement = { label: { en: ["Credit"] }, value: { en: ["Canvas credit"] } };
  const { canvas } = await importCanvas({ requiredStatementMetadataLabels: ["Restrictions on use"] }, statement);
  expect(canvas.requiredStatement).toEqual(statement);
  expect(canvas.metadata).toEqual([canvasMetadata, title, credit]);
});


test("source metadata can be recovered with distinct values when automatic import is disabled", async () => {
  const { vault, canvas } = await importCanvas({ addManifestMetadataToCanvas: false });
  const refs = getSourceManifestRefs(canvas.partOf);
  expect(refs.map((ref) => ref.id)).toContain(sourceId);
  const original = await loadSourceManifest(refs[0]!.id, { fetchManifest: async (id) => (await fetch(id)).json() });
  const groups = extractSourceMetadataGroups(original, { id: canvasId, type: "Canvas" });
  const rows = groups.flatMap((group) => describeSourceMetadata(group, canvas.metadata));
  const titleRow = rows.find((row) => row.item.label.en?.[0] === "Title")!;
  expect(titleRow.present).toBe(false);

  const metadata = new Editor(vault).edit({ id: canvasId, type: "Canvas" }).descriptive.metadata;
  metadata.add(titleRow.item.label, titleRow.item.value);
  expect(metadata.getWithoutTracking()).toEqual([canvasMetadata, title]);
});
