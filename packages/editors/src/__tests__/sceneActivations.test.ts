import { Vault4 } from "@iiif/helpers/vault-4";
import { describe, expect, test } from "vitest";
import {
  activationStateDiffersFromRest,
  addModelsToSceneActivation,
  createSceneActivation,
  duplicateSceneActivation,
  getSceneActivations,
  getSceneModels,
  removeActivationState,
  reorderActivationStates,
} from "../helpers/scene-activations";

const manifestId = "https://example.org/manifest";
const scene = { id: "https://example.org/scene", type: "Scene" as const };

function fixture() {
  const vault = new Vault4();
  vault.loadManifestSync(manifestId, {
    id: manifestId,
    type: "Manifest",
    label: { en: ["Manifest"] },
    items: [
      {
        ...scene,
        label: { en: ["Scene"] },
        items: [
          {
            id: `${scene.id}/paintings`,
            type: "AnnotationPage",
            items: [
              {
                id: `${scene.id}/model/one`,
                type: "Annotation",
                motivation: ["painting"],
                body: { id: "https://example.org/one.glb", type: "Model", label: { en: ["One"] } },
                target: scene,
              },
              {
                id: `${scene.id}/model/two`,
                type: "Annotation",
                motivation: ["painting"],
                body: { id: "https://example.org/two.glb", type: "Model", label: { en: ["Two"] } },
                target: scene,
              },
            ],
          },
        ],
        annotations: [],
      },
    ],
  } as any);
  return vault;
}

describe("Scene activations", () => {
  test("detects only meaningful differences from rest", () => {
    expect(activationStateDiffersFromRest({ action: ["show"], transform: [] })).toBe(false);
    expect(
      activationStateDiffersFromRest({
        action: ["show"],
        transform: [{ type: "TranslateTransform", x: 0, y: 0, z: 0 }],
      })
    ).toBe(false);
    expect(
      activationStateDiffersFromRest({
        action: ["show"],
        transform: [{ type: "TranslateTransform", z: 1 }],
      })
    ).toBe(true);
    expect(activationStateDiffersFromRest({ action: ["hide"] })).toBe(true);
  });

  test("creates, duplicates, adds, reorders and removes model states as valid P4", () => {
    const vault = fixture();
    const models = getSceneModels(scene, vault);
    expect(models.map((model) => model.label)).toEqual(["One", "Two"]);

    const activationId = createSceneActivation(
      scene,
      "First state",
      [{ id: models[0]!.annotation.id, type: "Annotation" }],
      vault
    );
    let activations = getSceneActivations(scene, vault);
    expect(activations).toHaveLength(1);
    expect(activations[0]).toMatchObject({ id: activationId, label: "First state" });
    expect(activations[0]!.states.map((state) => state.label)).toEqual(["One"]);

    addModelsToSceneActivation(activations[0]!, [{ id: models[1]!.annotation.id, type: "Annotation" }], vault);
    activations = getSceneActivations(scene, vault);
    expect(activations[0]!.states.map((state) => state.label)).toEqual(["One", "Two"]);

    reorderActivationStates(activations[0]!, 1, 0, vault);
    activations = getSceneActivations(scene, vault);
    expect(activations[0]!.states.map((state) => state.label)).toEqual(["Two", "One"]);

    removeActivationState(activations[0]!, activations[0]!.states[1]!.id, vault);
    activations = getSceneActivations(scene, vault);
    expect(activations[0]!.states.map((state) => state.label)).toEqual(["Two"]);

    const duplicateId = duplicateSceneActivation(scene, activations[0]!, vault);
    activations = getSceneActivations(scene, vault);
    expect(activations.map((activation) => activation.label)).toEqual(["First state", "Copy of First state"]);
    expect(activations[1]!.id).toBe(duplicateId);
    expect(activations[1]!.states[0]!.id).not.toBe(activations[0]!.states[0]!.id);

    const exported = vault.toPresentation4<any>({ id: manifestId, type: "Manifest" });
    const page = exported.items[0].annotations[0];
    expect(page.items.filter((item: any) => item.motivation?.includes("activating"))).toHaveLength(2);
    expect(page.items.find((item: any) => item.id === duplicateId).body.items[0]).toMatchObject({
      type: "SpecificResource",
      action: ["show"],
      source: { id: models[1]!.annotation.id, type: "Annotation" },
    });
  });
});
