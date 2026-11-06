import { afterEach, expect, test, vi } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { Creator, defineCreator } from "@manifest-editor/creator-api";
import { createFromManifestBrowserOutput } from "./manifest-browser-creator";

afterEach(() => vi.unstubAllGlobals());
test("collection browser inserts manifests and collections as one reversible selection", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify({
            id: url,
            type: url.endsWith("collection") ? "Collection" : "Manifest",
            label: { en: [url] },
            items: [],
          })
        )
    )
  );
  const vault = new Vault({ history: true });
  const parent = { id: "local", type: "Collection" as const };
  vault.loadSync(parent.id, { ...parent, items: [] });
  const before = vault.getState().iiif.entities;
  const definition = defineCreator({
    id: "test/collection-browser",
    label: "Browser",
    resourceType: "Manifest",
    supports: {},
    create: createFromManifestBrowserOutput,
  });
  const output = ["manifest", "collection"].map((type) => ({
    resource: { id: `https://example.org/${type}`, type: type === "manifest" ? "Manifest" : "Collection" },
  }));
  await new Creator(vault, [definition]).create(
    definition.id,
    { output },
    { parent: { resource: parent, property: "items", atIndex: 0 } }
  );
  expect(vault.get(parent).items.map((ref) => ref.id)).toEqual(output.map((item) => item.resource.id));
  const after = vault.getState().iiif.entities;
  expect(vault.history!.getState().undo).toHaveLength(1);
  expect(vault.undo()).toMatchObject({ ok: true });
  expect(vault.getState().iiif.entities).toEqual(before);
  expect(vault.redo()).toMatchObject({ ok: true });
  expect(vault.getState().iiif.entities).toEqual(after);
});
