import {
  DescriptiveProperties,
  LinkingProperties,
  Reference,
  StructuralProperties,
  TechnicalProperties,
} from "@iiif/presentation-3";
import { BaseEditor } from "./BaseEditor";
import { DescriptiveEditor } from "./DescriptiveEditor";
import { EditorConfig, EntityValidationResponse, TrackerState } from "./types";
import { PropertyObserver } from "./PropertyObserver";
import { SelfReferenceEditor } from "./SelfReferenceEditor";
import { TechnicalEditor } from "./TechnicalPropertiesEditor";
import { MetadataEditor } from "./MetadataEditor";
import { LinkingEditor } from "./LinkingEditor";
import { StructuralEditor } from "./StructuralEditor";
import { Vault } from "@iiif/vault";
import { resources } from "./meta/resources";
import { AnnotationEditor } from "@/editor-api/AnnotationEditor";

export class EditorInstance<
  T extends Partial<DescriptiveProperties> &
    Partial<TechnicalProperties> &
    Partial<LinkingProperties> &
    Partial<StructuralProperties<unknown>>
> extends BaseEditor<T> {
  technical: TechnicalEditor<T>;
  descriptive: DescriptiveEditor<T>;
  metadata: MetadataEditor<T>;
  linking: LinkingEditor<T>;
  structural: StructuralEditor<T>;
  annotation!: AnnotationEditor;
  required: (keyof T)[];
  recommended: (keyof T)[];
  notAllowed: string[];
  optional: (keyof T)[];
  allowed: (keyof T)[];
  isMultiple: boolean;
  context?: SelfReferenceEditor<T>;
  observe: TrackerState;

  constructor(_config: { vault: Vault; reference: Reference } & Partial<EditorConfig>) {
    const config: EditorConfig = _config as any;
    config.context = config.context || {};
    config.context.resource = config.context.resource || { type: "SpecificResource", source: config.reference };

    config.tracker = config.tracker || new PropertyObserver(config.vault, config.reference);
    super(config);
    this.observe = config.tracker;

    this.technical = new TechnicalEditor(config);
    this.descriptive = new DescriptiveEditor(config);
    this.metadata = this.descriptive.metadata;
    this.linking = new LinkingEditor(config);
    this.structural = new StructuralEditor(config);

    // Not yet supported.
    this.isMultiple = false;

    if (config.context.parent && config.context.parentProperty && typeof config.context.index !== "undefined") {
      // @todo still some questions about this one, and keeping the context updated.
      // Very likely to cause unexpected behavior, we NEED to track it and update it.
      this.context = new SelfReferenceEditor(config);
    }

    const type = this.getType() as any;

    if (type === "Annotation") {
      this.annotation = new AnnotationEditor(config);
    }

    const meta = resources.supported[type as "Manifest"] || resources.getSupported(type);

    this.required = meta.required;
    this.recommended = meta.recommended;
    this.notAllowed = meta.notAllowed;
    this.allowed = meta.allowed;
    this.optional = meta.optional;
  }

  ref() {
    return this.config.reference;
  }

  validate() {
    const validators = this.config.validators;
    const entity = this.entity() as any;
    const type = entity?.type;
    const response: EntityValidationResponse = {
      isError: false,
      isWarning: false,
      problems: [],
    };
    if (entity && type && validators.length) {
      if (type) {
        for (const validator of validators) {
          if (validator.types.includes(type)) {
            try {
              const isValid = validator.valid(entity, this.config.vault, this.config.context);
              if (!isValid) {
                if (validator.error) {
                  response.isError = true;
                } else if (validator.warning) {
                  response.isWarning = true;
                }
                response.problems.push({
                  isError: validator.error || false,
                  isWarning: validator.warning || false,
                  message: validator.message,
                  properties: validator.properties,
                });
              }
            } catch (e) {
              response.isWarning = true;
              response.problems.push({
                isWarning: true,
                isError: false,
                message: `Validation error: ${e || "unknown"}`,
                properties: validator.properties,
              });
            }
          }
        }
      }
    }
    return response;
  }
}
