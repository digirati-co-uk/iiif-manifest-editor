import { Vault4 } from "@iiif/helpers/vault-4";
import { describe, expect, test } from "vitest";
import { describeSceneAnnotation, isActivatingAnnotation } from "../helpers/scene-items";

describe("scene item descriptions", () => {
  test("identifies activation annotations", () => {
    expect(isActivatingAnnotation({ motivation: ["activating"] })).toBe(true);
    expect(isActivatingAnnotation({ motivation: "activating" })).toBe(true);
    expect(isActivatingAnnotation({ motivation: ["commenting"] })).toBe(false);
  });

  test("uses resource labels, filenames, and friendly type fallbacks instead of IDs", () => {
    const vault = new Vault4();
    const labelled = {
      id: "https://example.org/annotation/1",
      type: "Annotation",
      body: { id: "https://example.org/key", type: "DirectionalLight", label: { en: ["Key light"] } },
    };
    const model = {
      id: "https://example.org/annotation/2",
      type: "Annotation",
      body: { id: "https://example.org/models/damaged%20helmet.glb", type: "Model" },
    };
    const camera = {
      id: "https://example.org/annotation/3",
      type: "Annotation",
      body: { id: "https://example.org/camera/uuid", type: "PerspectiveCamera" },
    };
    const html = {
      id: "https://example.org/annotation/4",
      type: "Annotation",
      body: {
        id: "https://example.org/body/4",
        type: "TextualBody",
        value: "<p>Pawn <strong>surface</strong> annotation</p>",
      },
    };

    vault.loadSync("https://example.org/annotation/1", labelled as any);
    vault.loadSync("https://example.org/annotation/2", model as any);
    vault.loadSync("https://example.org/annotation/3", camera as any);
    vault.loadSync("https://example.org/annotation/4", html as any);

    expect(describeSceneAnnotation(labelled, vault).label).toBe("Key light");
    expect(describeSceneAnnotation(model, vault).label).toBe("damaged helmet");
    expect(describeSceneAnnotation(camera, vault, 2)).toMatchObject({
      label: "Perspective camera 3",
      group: "Cameras",
    });
    expect(describeSceneAnnotation(html, vault).label).toBe("Pawn surface annotation");
  });
});
