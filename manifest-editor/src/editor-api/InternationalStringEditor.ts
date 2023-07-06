import { InternationalString } from "@iiif/presentation-3";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { EditorConfig } from "./types";

export class InternationalStringEditor<Entity> extends BasePropertyEditor<Entity, InternationalString> {
  constructor(config: EditorConfig, property: string) {
    super(config, property);
  }
}
