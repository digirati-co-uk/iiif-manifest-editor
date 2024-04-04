import { LinkingProperties, Reference, Service } from "@iiif/presentation-3";
import { BaseEditor } from "./BaseEditor";
import { EditorConfig } from "./types";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";

export class LinkingEditor<T extends Partial<LinkingProperties>> extends BaseEditor<T> {
  seeAlso: BaseReferenceListEditor<T, Reference<"ContentResource">>;
  service: BaseReferenceListEditor<T, Service>;
  services: BaseReferenceListEditor<T, Service>;
  rendering: BaseReferenceListEditor<T, Reference<"ContentResource">>;
  partOf: BaseReferenceListEditor<
    T,
    Reference<"ContentResource"> | Reference<"Canvas"> | Reference<"AnnotationCollection">
  >;
  start: BasePropertyEditor<T, Reference<"Canvas"> | null>;
  supplementary: BaseReferenceListEditor<T, Reference<"ContentResource">>;
  homepage: BaseReferenceListEditor<T, Reference<"ContentResource">>;
  logo: BaseReferenceListEditor<T, Reference<"ContentResource">>;

  constructor(config: EditorConfig) {
    super(config);

    // @todo these could use custom editors.
    this.seeAlso = new BaseReferenceListEditor(config, "seeAlso");
    this.service = new BaseReferenceListEditor(config, "service");
    this.services = new BaseReferenceListEditor(config, "services");
    this.rendering = new BaseReferenceListEditor(config, "rendering");
    this.partOf = new BaseReferenceListEditor(config, "partOf");
    this.start = new BasePropertyEditor(config, "start");
    this.supplementary = new BaseReferenceListEditor(config, "supplementary");
    this.homepage = new BaseReferenceListEditor(config, "homepage");
    this.logo = new BaseReferenceListEditor(config, "logo");
  }
}
