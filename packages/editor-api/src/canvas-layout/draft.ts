import { Vault, type HistoryResult } from "@iiif/helpers/vault";
import type { CanvasNormalized } from "@iiif/presentation-3-normalized";
import { documentValuesEqual } from "../history";
import { captureCanvasComposition, restoreCanvasComposition } from "./layout";

/** Composition previews never mutate the editing document. Reducers share immutable inputs. */
export class CanvasCompositionDraft {
  readonly vault: Vault;
  private readonly base;
  private closed = false;
  private stopReset: () => void;
  constructor(
    private source: Vault,
    private canvasId: string
  ) {
    const canvas = source.get({ id: canvasId, type: "Canvas" });
    this.base = captureCanvasComposition(source, canvas);
    this.stopReset = source.getStore().onReset(() => {
      this.closed = true;
    });
    this.vault = new Vault({ defaultState: { iiif: source.getState().iiif }, enableDevtools: false });
  }
  get canvas(): CanvasNormalized {
    return this.vault.get({ id: this.canvasId, type: "Canvas" });
  }
  apply(): HistoryResult {
    if (this.closed) return { ok: false, reason: "disabled" };
    const current = this.source.get({ id: this.canvasId, type: "Canvas" });
    if (!current || !documentValuesEqual(this.base, captureCanvasComposition(this.source, current))) {
      return { ok: false, reason: "conflict", conflict: "value", path: ["iiif", "entities", "Canvas", this.canvasId] };
    }
    const next = captureCanvasComposition(this.vault, this.canvas);
    const group = this.source.beginInteraction({ label: "Edit canvas composition" });
    try {
      restoreCanvasComposition(group.vault, this.canvasId, next);
    } finally {
      group.finish();
    }
    this.closed = true;
    this.stopReset();
    return { ok: true, groupId: group.id };
  }
  discard() {
    this.closed = true;
    this.stopReset();
  }
}
