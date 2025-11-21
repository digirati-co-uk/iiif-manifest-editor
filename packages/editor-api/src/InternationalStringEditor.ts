import type { InternationalString } from "@iiif/presentation-3";
import { BasePropertyEditor } from "./BasePropertyEditor";
import type { EditorConfig } from "./types";

export class InternationalStringEditor<Entity> extends BasePropertyEditor<
  Entity,
  InternationalString
> {
  constructor(config: EditorConfig, property: string) {
    super(config, property);
  }

  setValueForLanguage(language: string, value: string) {
    const intlString = this.getWithoutTracking();

    const newIntlString = {
      ...intlString,
      [language]: [value],
    };

    this.set(newIntlString);
  }
}
