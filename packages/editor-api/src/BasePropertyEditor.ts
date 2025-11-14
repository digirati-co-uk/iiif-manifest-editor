import { BaseEditor } from "./BaseEditor";
import { descriptiveProperties } from "./meta/descriptive";
import type { EditorConfig } from "./types";

export class BasePropertyEditor<Entity, T> extends BaseEditor<Entity> {
  protected property: string;
  constructor(config: EditorConfig, property: string) {
    super(config);
    this.property = property as any;
  }

  getProperty() {
    return this.property;
  }

  observe(
    cb: (selected: T, resource: Entity, context: any) => void,
    skipInitial = true,
  ) {
    this._observe(
      (entity) => entity && (entity as any)[this.property],
      cb,
      skipInitial,
    );
  }

  focusId() {
    return `${super.focusId()}_${this.property}`;
  }

  containerId() {
    return `container_${super.focusId()}_${this.property}`;
  }

  getContainerProps() {
    return {
      "data-property": this.property,
      "data-resource-id": this.getId(),
      "data-resource-type": this.getType(),
    };
  }

  isRequired() {
    const type = this.getType();
    const required =
      descriptiveProperties.required[type as unknown as "Manifest"] || [];
    return required.indexOf(this.property as any) !== -1;
  }

  isRecommended() {
    const type = this.getType();
    const recommended =
      descriptiveProperties.recommended[type as unknown as "Manifest"] || [];
    return recommended.indexOf(this.property as any) !== -1;
  }

  isNotAllowed() {
    const type = this.getType();
    const notAllowed =
      descriptiveProperties.notAllowed[type as unknown as "Manifest"] || [];
    return notAllowed.indexOf(this.property as any) !== -1;
  }

  isOptional(orRecommended = false) {
    const type = this.getType();
    const optional =
      descriptiveProperties.optional[type as unknown as "Manifest"] || [];
    if (!optional && orRecommended) {
      return this.isRecommended();
    }
    return optional.indexOf(this.property as any) !== -1;
  }

  validate() {
    const validators = this.config.validators;
    const entity = this.entity() as any;
    const type = entity?.type;
    const response = {
      isError: false,
      isWarning: false,
      warnings: [] as string[],
      errors: [] as string[],
    };
    if (entity && type && validators.length) {
      if (type) {
        for (const validator of validators) {
          if (
            validator.types.includes(type) &&
            validator.properties.includes(this.property)
          ) {
            try {
              const isValid = validator.valid(
                entity,
                this.config.vault,
                this.config.context,
              );
              if (!isValid) {
                if (validator.error) {
                  response.isError = true;
                  response.errors.push(validator.message);
                } else if (validator.warning) {
                  response.isWarning = true;
                  response.warnings.push(validator.message);
                }
              }
            } catch (e) {
              response.isWarning = true;
              response.warnings.push(`Validation error: ${e || "unknown"}`);
            }
          }
        }
      }
    }
    return response;
  }

  getWithoutTracking(): T {
    const entity: any = this.entity();
    return (entity && entity[this.property]) as any;
  }

  get(): T {
    this.config.tracker.track(this.property);
    return this.getWithoutTracking();
  }

  set(value: T) {
    this.config.vault.modifyEntityField(
      this.config.reference as any,
      this.property,
      value,
    );
  }
}
