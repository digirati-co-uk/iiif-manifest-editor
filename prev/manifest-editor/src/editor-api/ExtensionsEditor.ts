import { NavPlaceExtension, TextGranularityExtension } from "@iiif/presentation-3";
import { BaseEditor } from "@/editor-api/BaseEditor";
import { EditorConfig } from "@/editor-api/types";
import { NavPlaceEditor } from "@/editor-api/NavPlaceEditor";
import { BasePropertyEditor } from "@/editor-api/BasePropertyEditor";

export class ExtensionsEditor<T extends Partial<NavPlaceExtension & TextGranularityExtension>> extends BaseEditor<T> {
  navPlace: NavPlaceEditor<T>;
  textGranularity: BasePropertyEditor<T, TextGranularityExtension["textGranularity"]>;
  constructor(config: EditorConfig) {
    super(config);

    this.navPlace = new NavPlaceEditor(config);
    this.textGranularity = new BasePropertyEditor(config, "textGranularity");
  }
}
