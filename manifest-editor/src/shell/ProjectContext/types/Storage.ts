// Storage
import { Manifest } from "@iiif/presentation-3";
import { EntityStore } from "@iiif/vault/dist";

export interface Storage {
  type: string;
  error?: {
    message: string;
  };
  data: any;
}

export interface ManifestStorage {
  type: "manifest-storage";
  // Possibly annotation pages, or other things editable in the editor.
  // Should only be for content, not configuration.
  data: Manifest;
}

export interface ManifestKeyedStorage {
  type: "manifest-keyed-storage";
  // Possibly annotation pages, or other things editable in the editor.
  // Should only be for content, not configuration.
  data: {
    id: string;
    key: string;
  };
}

export interface VaultManifestStorage {
  type: "vault-storage";
  data: {
    id: string;
    type: "Manifest";
    store: EntityStore;
  };
}

export interface ExternalManifestStorage {
  type: "external";
  data: {
    id: string;
    type: "Manifest";
  };
}
