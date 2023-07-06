// Storage
import { Collection, Manifest } from "@iiif/presentation-3";
import { EntityStore } from "@iiif/vault";

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

export interface CollectionStorage {
  type: "collection-storage";
  data: Collection;
}

export interface RemoteWebsocketStorage {
  type: "remote-websocket-storage";
  data: {
    id: string;
    type: string;
  };
}

export interface ResourceKeyedStorage {
  type: "resource-keyed-storage";
  // Possibly annotation pages, or other things editable in the editor.
  // Should only be for content, not configuration.
  data: {
    id: string;
    type: string;
    key: string;
  };
}

export interface VaultStorage {
  type: "vault-storage";
  data: {
    id: string;
    type: "Manifest" | "Collection";
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

export interface ExternalCollectionStorage {
  type: "external";
  data: {
    id: string;
    type: "Collection";
  };
}
