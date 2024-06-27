import { BasePropertyEditor } from "./BasePropertyEditor";
import { EditorConfig } from "./types";
import { NavPlaceExtension } from "@iiif/presentation-3";

export class NavPlaceEditor<T> extends BasePropertyEditor<T, NavPlaceExtension["navPlace"]> {
  constructor(config: EditorConfig) {
    super(config, "navPlace");
  }
}
