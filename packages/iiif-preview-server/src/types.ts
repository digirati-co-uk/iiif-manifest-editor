export interface StoredResource {
  manifest: string;
  update: string;
  delete: string;
  type: string;
}

export interface StorageInterface {
  get: (key: string) => Promise<StoredResource | null>;
  delete: (key: string) => Promise<void>;
  put: (
    key: string,
    value: StoredResource,
    options: { expirationTtl: number; metadata: { ttl: number } }
  ) => Promise<void>;
  getWithMetadata: <T>(key: string) => Promise<{ value: StoredResource | null; metadata: T | null }>;
  purgeCache?: () => Promise<void>;
}

export interface Config {
  keyLength: number;
  partLength: number;
  updateKeyLength: number;
  expirationTtl: number;
  encryptedEnabled: boolean;
  rotatingUpdateKey: boolean;
}

export interface RouteConfig extends Config {
  baseUrl: string;
  storage: StorageInterface;
}
