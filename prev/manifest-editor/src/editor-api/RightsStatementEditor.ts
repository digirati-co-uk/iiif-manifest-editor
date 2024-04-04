import { BasePropertyEditor } from "./BasePropertyEditor";
import { creativeCommons } from "./meta/rights";
import { EditorConfig } from "./types";

export class RightsStatementEditor<T> extends BasePropertyEditor<T, string> {
  constructor(config: EditorConfig) {
    super(config, "rights");
  }

  getClean() {
    let value = this.get();
    if (value) {
      value.replace(/https/, "http");
      if (!value.endsWith("/")) {
        value += "/";
      }
    }
    return value;
  }

  getDefinition() {
    const value = this.getClean();
    return creativeCommons.find((v) => v.value === value) || null;
  }

  getIcon() {
    const definition = this.getDefinition();
    if (definition) {
      return definition.icon;
    }
  }

  getOptions() {
    return creativeCommons;
  }
}
