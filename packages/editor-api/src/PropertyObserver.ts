import { Vault } from "@iiif/helpers/vault";
import { TrackerState } from "./types";

export class PropertyObserver implements TrackerState {
  observed: string[];
  vault: Vault;
  entity: any;
  key = "";

  constructor(vault: Vault, entity: any) {
    this.vault = vault;
    this.observed = [];
    this.entity = entity;
  }

  subscribe(cb: (entity: any) => void) {
    return this.vault.subscribe(() => this.vault.get(this.entity), cb, true);
  }

  start(onChange: () => void) {
    let lastEntity = this.vault.get(this.entity);
    let lastProps: any[] = [];

    return this.vault.subscribe(
      () => {
        const entity = this.vault.get(this.entity);
        if (entity === lastEntity) {
          return lastProps;
        }
        lastEntity = entity;
        const props = [];
        for (const prop of this.observed) {
          props.push(prop);
          const value = entity[prop];
          if (Array.isArray(value)) {
            props.push(...value);
          } else {
            props.push(value);
          }
        }
        lastProps = props;
        return props;
      },
      onChange as any,
      true
    );
  }

  track(key: string): void {
    if (!this.observed.includes(key)) {
      this.observed.push(key);
    }
  }

  reset(): void {
    this.observed = [];
  }
}
