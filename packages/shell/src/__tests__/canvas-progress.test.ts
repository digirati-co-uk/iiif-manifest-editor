import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import {
  CANVAS_PROGRESS_META_NAMESPACE,
  clearCanvasProgressStatus,
  createManifestEditorCanvasProgressApi,
  getCanvasProgressStatus,
  getCanvasProgressStatusFromState,
  setCanvasProgressStatus,
} from "../CanvasProgress";

const manifestRef = { id: "https://example.org/manifest", type: "Manifest" };
const canvasRef = { id: "https://example.org/canvas/1", type: "Canvas" };

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

describe("manifest editor canvas progress", () => {
  test("sets and clears canvas progress status in Vault meta", () => {
    const vault = createVault();

    setCanvasProgressStatus(vault, canvasRef, "queued");
    expect(getCanvasProgressStatus(vault, canvasRef)).toBe("queued");
    expect(vault.getResourceMeta(canvasRef.id, CANVAS_PROGRESS_META_NAMESPACE)).toEqual({ status: "queued" });

    setCanvasProgressStatus(vault, canvasRef, "pending");
    expect(getCanvasProgressStatus(vault, canvasRef)).toBe("pending");

    clearCanvasProgressStatus(vault, canvasRef);
    expect(getCanvasProgressStatus(vault, canvasRef)).toBe("none");
  });

  test("creates a canvas progress api bound to a vault", () => {
    const vault = createVault();
    const progress = createManifestEditorCanvasProgressApi(vault);

    progress.setStatus(canvasRef, "done");

    expect(progress.getStatus(canvasRef)).toBe("done");

    progress.clearStatus(canvasRef);

    expect(progress.getStatus(canvasRef)).toBe("none");
  });

  test("reads canvas progress from vault state for reactive selectors", () => {
    const vault = createVault();

    setCanvasProgressStatus(vault, canvasRef, "queued");

    expect(getCanvasProgressStatusFromState(vault.getState(), canvasRef)).toBe("queued");
  });

  test("does not serialise canvas progress into Presentation 3", () => {
    const vault = createVault();

    setCanvasProgressStatus(vault, canvasRef, "pending");

    const presentation3 = vault.toPresentation3<any>(manifestRef);
    const serialised = JSON.stringify(presentation3);

    expect(serialised).not.toContain(CANVAS_PROGRESS_META_NAMESPACE);
    expect(serialised).not.toContain("pending");
  });
});
