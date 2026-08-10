import { Vault4 } from "@iiif/helpers/vault-4";
import { Creator, matchBasedOnResource } from "@manifest-editor/creator-api";
import { describe, expect, test, vi } from "vitest";
import { modelAnnotation } from "../../../creators/src/Annotation/ModelAnnotation";

vi.mock("@manifest-editor/components", () => ({
  ActionButton: () => null,
  EmptyCanvasIcon: () => null,
  PaddedSidebarContainer: () => null,
}));
vi.mock("@manifest-editor/editors", () => ({
  Input: () => null,
  InputContainer: () => null,
  InputLabel: () => null,
}));

describe("3D model manifest item creator", () => {
  test("appears with Canvas creators and adds a Scene to manifest items", async () => {
    const vault = new Vault4();
    const manifest = { id: "https://example.org/manifest", type: "Manifest" as const };
    vault.loadManifestSync(manifest.id, { ...manifest, label: { en: ["Manifest"] }, items: [] });

    expect(
      matchBasedOnResource(
        { type: "Canvas", parent: manifest, property: "items", isPainting: true },
        [modelAnnotation],
        { vault }
      )
    ).toEqual([modelAnnotation]);

    const creator = new Creator(vault, [modelAnnotation] as any);
    const created = await creator.create(
      modelAnnotation.id,
      { url: "https://example.org/models/astronaut.glb" },
      {
        targetType: "Canvas",
        parent: { resource: manifest, property: "items" },
      }
    );

    expect(created).toMatchObject({ type: "Scene" });
    expect(vault.get(manifest).items).toEqual([created]);

    const scene = vault.get(created as any);
    const page = vault.get(scene.items[0]);
    const annotation = vault.get(page.items[0]);
    expect(scene).toMatchObject({ type: "Scene", label: { en: ["astronaut"] } });
    expect(annotation).toMatchObject({
      motivation: "painting",
      target: { type: "SpecificResource", source: created },
    });
    expect(vault.get(annotation.body[0])).toMatchObject({
      id: "https://example.org/models/astronaut.glb",
      type: "Model",
      format: "model/gltf-binary",
    });
  });
});
