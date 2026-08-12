import type { Vault4 } from "@iiif/helpers/vault-4";
import type { Reference } from "@iiif/parser";
import type { EditorConfig } from "./types";

export class BaseEditor<T> {
  protected config: EditorConfig;
  constructor(config: EditorConfig) {
    if (!config.validators) {
      config.validators = [];
    }

    this.config = config;
  }

  protected entity(): T {
    const ref = this.ref();
    return this.config.vault.get(ref, { skipSelfReturn: false });
  }

  ref = (): Reference => {
    return this.config.reference;
  };

  protected getId(): string {
    const ref = this.ref();
    return ref.id;
  }

  protected getType(): string {
    const ref = this.ref();
    return ref.type;
  }

  focusId() {
    // @todo maybe need to change this in the future to make it more human-y based on config.
    return `${this.getId()}_${this.getType()}`;
  }

  protected _observe(
    selector: (resource: T, context: any, vault: Vault4) => any,
    cb: (selected: any, resource: T, context: any) => void,
    skipInitial = true
  ) {
    return this.config.vault.subscribe(
      () => selector(this.entity(), this.config.context, this.config.vault),
      (selected) => {
        cb(selected, this.entity(), this.config.context);
      },
      skipInitial
    );
  }
}
