import { Reference, SpecificResource } from "@iiif/presentation-3";
import { Vault } from "@iiif/helpers/vault";
import { isSpecificResource } from "@iiif/parser";

export class ReferencedResource {
  vault: Vault;
  original: Reference | SpecificResource;
  reference: Reference;
  resource: SpecificResource;
  constructor(reference: Reference | SpecificResource, vault: Vault) {
    this.vault = vault;
    this.original = reference;
    this.reference = isSpecificResource(reference) ? reference.source : reference;
    this.resource = isSpecificResource(reference) ? reference : { type: "SpecificResource", source: this.reference };
  }

  // @todo editable specific resource.

  ref() {
    return this.reference;
  }

  specificResource() {
    return this.resource;
  }

  optionalSpecificResource() {
    if (isSpecificResource(this.original)) {
      return {
        ...this.original,
        source: { id: this.original.source?.id, type: this.original.source?.type },
      };
    }

    // @todo check if there are targets here that would make this a specific resource.
    return this.original;
  }

  get() {
    return this.vault.get(this.resource);
  }
}
