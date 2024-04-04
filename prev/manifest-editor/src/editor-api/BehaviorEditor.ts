import { BehaviorChoice } from "@/_components/editors/BehaviorEditor/BehaviorEditor.types";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { supportedBehaviorConfig } from "./meta/behavior";
import { EditorConfig } from "./types";

export class BehaviorEditor<T> extends BasePropertyEditor<T, string[]> {
  constructor(config: EditorConfig) {
    super(config, "behavior");
  }

  getSupported(): BehaviorChoice[] {
    return supportedBehaviorConfig[this.getType() as "Manifest"] || [];
  }
}
