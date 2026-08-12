import { Vault4 } from "@iiif/helpers/vault-4";
import { validateAuthoredPresentation4 } from "@iiif/parser/presentation-4/validator";
import { describe, expect, test } from "vitest";
import {
  activationStateDiffersFromRest,
  addModelsToSceneActivation,
  createSceneActivation,
  duplicateSceneActivation,
  getSceneActivations,
  getSceneModels,
  removeActivationState,
  removeSceneActivation,
  reorderActivationStates,
  reorderSceneActivations,
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
    expect(activationStateDiffersFromRest({ action: ["hide", "show"] })).toBe(false);
    expect(activationStateDiffersFromRest({ action: ["show", "hide"] })).toBe(true);
    expect(activationStateDiffersFromRest({ action: ["disable", "enable"] })).toBe(false);
    expect(activationStateDiffersFromRest({ action: ["start", "stop"] })).toBe(false);
    expect(activationStateDiffersFromRest({ action: ["show"], selector: [{ type: "AnimationSelector" }] })).toBe(false);
    expect(
      activationStateDiffersFromRest({
        action: ["reset"],
        transform: [{ type: "TranslateTransform", z: 1 }],
      })
    ).toBe(false);
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

    addModelsToSceneActivation(scene, activations[0]!, [{ id: models[1]!.annotation.id, type: "Annotation" }], vault);
    activations = getSceneActivations(scene, vault);
    expect(activations[0]!.states.map((state) => state.label)).toEqual(["One", "Two"]);

    reorderActivationStates(activations[0]!, 1, 0, vault);
    activations = getSceneActivations(scene, vault);
    expect(activations[0]!.states.map((state) => state.label)).toEqual(["Two", "One"]);

    removeActivationState(activations[0]!, activations[0]!.states[1]!.id, vault);
    activations = getSceneActivations(scene, vault);
    expect(activations[0]!.states.map((state) => state.label)).toEqual(["Two"]);
    expect(removeActivationState(activations[0]!, activations[0]!.states[0]!.id, vault)).toBe(false);
    vault.modifyEntityField(activations[0]!.states[0]!.ref as any, "label", { en: ["Preserved state"] });
    vault.modifyEntityField({ id: activations[0]!.body.id, type: "ContentResource" } as any, "label", {
      en: ["Preserved list"],
    });

    const duplicateId = duplicateSceneActivation(scene, activations[0]!, vault);
    activations = getSceneActivations(scene, vault);
    expect(activations.map((activation) => activation.label)).toEqual(["First state", "Copy of First state"]);
    expect(activations[1]!.id).toBe(duplicateId);
    expect(activations[1]!.states[0]!.id).not.toBe(activations[0]!.states[0]!.id);

    const exported = vault.toPresentation4<any>({ id: manifestId, type: "Manifest" });
    const page = exported.items[0].annotations[0];
    expect(page.items.filter((item: any) => item.motivation?.includes("activating"))).toHaveLength(2);
    const duplicated = page.items.find((item: any) => item.id === duplicateId);
    expect(duplicated.body).toMatchObject({ label: { en: ["Preserved list"] } });
    expect(duplicated.body.items[0]).toMatchObject({
      type: "SpecificResource",
      action: ["show", "enable"],
      label: { en: ["Preserved state"] },
      source: { id: models[1]!.annotation.id, type: "Annotation" },
    });
    expect(validateAuthoredPresentation4(exported).issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  test("normalizes a direct state body before adding another model", () => {
    const vault = fixture();
    const models = getSceneModels(scene, vault);
    const id = createSceneActivation(scene, "Direct", [{ id: models[0]!.annotation.id, type: "Annotation" }], vault);
    let activation = getSceneActivations(scene, vault).find((candidate) => candidate.id === id)!;
    vault.modifyEntityField({ id, type: "Annotation" } as any, "body", [activation.states[0]!.ref]);

    activation = getSceneActivations(scene, vault).find((candidate) => candidate.id === id)!;
    expect(activation.body.type).toBe("SpecificResource");
    addModelsToSceneActivation(scene, activation, [{ id: models[1]!.annotation.id, type: "Annotation" }], vault);

    activation = getSceneActivations(scene, vault).find((candidate) => candidate.id === id)!;
    expect(activation.body.type).toBe("List");
    expect(activation.states.map((state) => state.source.id)).toEqual([
      models[0]!.annotation.id,
      models[1]!.annotation.id,
    ]);
  });

  test("deletes only owned targets and reorders only activation slots", () => {
    const vault = fixture();
    const models = getSceneModels(scene, vault).map((model) => ({
      id: model.annotation.id,
      type: "Annotation" as const,
    }));
    const firstId = createSceneActivation(scene, "First", models, vault);
    createSceneActivation(scene, "Second", models, vault);
    let activations = getSceneActivations(scene, vault);
    const page = activations[0]!.page;
    const marker = { id: `${scene.id}/marker`, type: "Annotation", motivation: ["commenting"], target: scene };
    vault.loadSync(marker.id, marker as any);
    const items = [...page.items];
    items.splice(2, 0, { id: marker.id, type: "Annotation" });
    vault.modifyEntityField({ id: page.id, type: "AnnotationPage" } as any, "items", items);

    activations = getSceneActivations(scene, vault);
    const before = vault.get<any>({ id: page.id, type: "AnnotationPage" })!.items;
    reorderSceneActivations(activations, 0, 1, vault);
    const after = vault.get<any>({ id: page.id, type: "AnnotationPage" })!.items;
    expect(after.findIndex((item: any) => item.id === marker.id)).toBe(
      before.findIndex((item: any) => item.id === marker.id)
    );
    expect(getSceneActivations(scene, vault).map((activation) => activation.label)).toEqual(["Second", "First"]);

    const first = getSceneActivations(scene, vault).find((activation) => activation.id === firstId)!;
    const importedTarget = {
      id: `${scene.id}/imported-comment`,
      type: "Annotation",
      motivation: ["commenting"],
      target: scene,
    };
    vault.loadSync(importedTarget.id, importedTarget as any);
    vault.modifyEntityField({ id: page.id, type: "AnnotationPage" } as any, "items", [
      ...after,
      { id: importedTarget.id, type: "Annotation" },
    ]);
    vault.modifyEntityField({ id: first.id, type: "Annotation" } as any, "target", [
      { id: importedTarget.id, type: "Annotation" },
    ]);
    const importedActivation = getSceneActivations(scene, vault).find((activation) => activation.id === firstId)!;
    removeSceneActivation(scene, importedActivation, vault);
    expect(vault.get<any>({ id: page.id, type: "AnnotationPage" })!.items).toContainEqual({
      id: importedTarget.id,
      type: "Annotation",
    });
  });
});
