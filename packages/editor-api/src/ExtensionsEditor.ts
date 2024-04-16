import { NavPlaceExtension, TextGranularityExtension } from "@iiif/presentation-3";
import { BaseEditor } from "./BaseEditor";
import { EditorConfig } from "./types";
import { NavPlaceEditor } from "./NavPlaceEditor";
import { BasePropertyEditor } from "./BasePropertyEditor";

export class ExtensionsEditor<T extends Partial<NavPlaceExtension & TextGranularityExtension>> extends BaseEditor<T> {
  navPlace: NavPlaceEditor<T>;
  textGranularity: BasePropertyEditor<T, TextGranularityExtension["textGranularity"]>;
  constructor(config: EditorConfig) {
    super(config);

    this.navPlace = new NavPlaceEditor(config);
    this.textGranularity = new BasePropertyEditor(config, "textGranularity");
  }
}
