import { BasePropertyEditor } from "./BasePropertyEditor";
import { type BehaviorChoice, supportedBehaviorConfig } from "./meta/behavior";
import type { EditorConfig } from "./types";

export class BehaviorEditor<T> extends BasePropertyEditor<T, string[]> {
  constructor(config: EditorConfig) {
    super(config, "behavior");
  }

  getSupported(): BehaviorChoice[] {
    return supportedBehaviorConfig[this.getType() as "Manifest"] || [];
  }

  fix(b: unknown): string[] {
    if (!b) {
      return [];
    }
    if (typeof b === "string") {
      return [b];
    }

    if (!Array.isArray(b)) {
      return [];
    }

    const first = b[0];
    if (!first) {
      return [];
    }

    if (Array.isArray(first)) {
      return this.fix(first);
    }

    return b.filter((t) => typeof t === "string");
  }

  get(): string[] {
    const item = super.get();
    return this.fix(item);
  }

  set(value: string[]) {
    super.set(this.fix(value));
  }
}
