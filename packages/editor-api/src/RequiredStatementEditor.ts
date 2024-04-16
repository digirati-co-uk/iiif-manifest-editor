import { DescriptiveProperties, InternationalString, MetadataItem } from "@iiif/presentation-3";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { EditorConfig } from "./types";

export class RequiredStatementEditor<T> extends BasePropertyEditor<T, DescriptiveProperties["requiredStatement"]> {
  constructor(config: EditorConfig) {
    super(config, "requiredStatement");
  }

  updateLabel(text: string | InternationalString) {
    const current = this.getWithoutTracking();

    const newValue: MetadataItem = {
      value: { none: [""] },
      ...(current || {}),
      label: typeof text === "string" ? { none: [text] } : text,
    };

    this.set(newValue);
  }

  update(text: InternationalString) {
    const current = this.getWithoutTracking();

    const newValue: MetadataItem = {
      label: { none: [""] },
      ...(current || {}),
      value: typeof text === "string" ? { none: [text] } : text,
    };

    this.set(newValue);
  }
}
