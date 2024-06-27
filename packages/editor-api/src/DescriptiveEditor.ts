import { DescriptiveProperties, Reference } from "@iiif/presentation-3";
import { BaseEditor } from "./BaseEditor";
import { EditorConfig } from "./types";
import { MetadataEditor } from "./MetadataEditor";
import { RequiredStatementEditor } from "./RequiredStatementEditor";
import { RightsStatementEditor } from "./RightsStatementEditor";
import { NavDateEditor } from "./NavDateEditor";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { InternationalStringEditor } from "./InternationalStringEditor";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";

export class DescriptiveEditor<T extends Partial<DescriptiveProperties>> extends BaseEditor<T> {
  label: InternationalStringEditor<T>;
  summary: InternationalStringEditor<T>;
  metadata: MetadataEditor<T>;
  requiredStatement: RequiredStatementEditor<T>;
  rights: RightsStatementEditor<T>;
  navDate: NavDateEditor<T>;
  language: BasePropertyEditor<T, string[]>;
  thumbnail: BaseReferenceListEditor<T, Reference<"ContentResource">>;
  provider: BasePropertyEditor<T, Reference<"Agent">[]>;
  placeholderCanvas: BasePropertyEditor<T, Reference<"Canvas">>;
  accompanyingCanvas: BasePropertyEditor<T, Reference<"Canvas">>;
  value: BasePropertyEditor<T, any>;

  constructor(config: EditorConfig) {
    super(config);

    this.label = new InternationalStringEditor(config, "label");
    this.metadata = new MetadataEditor(config);
    this.summary = new InternationalStringEditor(config, "summary");
    this.requiredStatement = new RequiredStatementEditor(config);
    this.rights = new RightsStatementEditor(config);
    this.navDate = new NavDateEditor(config);
    this.language = new BasePropertyEditor(config, "language");

    this.thumbnail = new BaseReferenceListEditor<T, Reference<"ContentResource">>(config, "thumbnail");
    this.provider = new BasePropertyEditor(config, "provider");
    this.placeholderCanvas = new BasePropertyEditor(config, "placeholderCanvas");
    this.accompanyingCanvas = new BasePropertyEditor(config, "accompanyingCanvas");
    // @todo maybe move this..
    this.value = new BasePropertyEditor<T, any>(config, "value");
  }
}
