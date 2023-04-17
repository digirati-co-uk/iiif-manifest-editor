import { Reference } from "@iiif/presentation-3";
import { Vault } from "@iiif/vault";

export class ReferencedResource {
  vault: Vault;
  reference: Reference;
  constructor(reference: Reference, vault: Vault) {
    this.vault = vault;
    this.reference = reference;
  }

  ref() {
    return this.reference;
  }

  specificResource() {
    // @todo get all fields available here, make them editable.
    return {
      type: "SpecificResource",
      source: this.reference,
    };
  }

  optionalSpecificResource() {
    // @todo check if there are targets here that would make this a specific resource.
    return this.reference;
  }

  get() {
    return this.vault.get(this.reference);
  }
}
