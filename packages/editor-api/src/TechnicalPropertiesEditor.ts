import { SpecificationTimeMode, TechnicalProperties, ViewingDirection } from "@iiif/presentation-3";
import { BaseEditor } from "./BaseEditor";
import { EditorConfig } from "./types";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { ReadonlyProperty } from "./ReadonlyProperty";
import { BehaviorEditor } from "./BehaviorEditor";

export class TechnicalEditor<T extends Partial<TechnicalProperties>> extends BaseEditor<T> {
  id: ReadonlyProperty<T, string>;
  type: string;
  mediaType: BasePropertyEditor<T, string>;
  format: BasePropertyEditor<T, string>;
  profile: BasePropertyEditor<T, string>;
  height: BasePropertyEditor<T, number>;
  width: BasePropertyEditor<T, number>;
  duration: BasePropertyEditor<T, number>;
  viewingDirection: BasePropertyEditor<T, ViewingDirection>;
  behavior: BehaviorEditor<T>;
  timeMode: BasePropertyEditor<T, SpecificationTimeMode | string | null>;
  motivation: BasePropertyEditor<T, string | null>;

  constructor(config: EditorConfig) {
    super(config);

    this.id = new ReadonlyProperty(config, "id");
    this.type = this.entity().type || config.reference.type;
    this.mediaType = new BasePropertyEditor(config, "type");

    this.format = new BasePropertyEditor(config, "format");
    this.profile = new BasePropertyEditor(config, "profile");
    this.height = new BasePropertyEditor(config, "height");
    this.width = new BasePropertyEditor(config, "width");
    this.duration = new BasePropertyEditor(config, "duration");
    this.viewingDirection = new BasePropertyEditor(config, "viewingDirection");
    this.behavior = new BehaviorEditor(config);
    this.timeMode = new BasePropertyEditor(config, "timeMode");
    this.motivation = new BasePropertyEditor(config, "motivation");
  }
}
