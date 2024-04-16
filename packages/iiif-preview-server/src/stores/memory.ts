import { StorageInterface, StoredResource } from "../types";

export function createMemoryStore(): StorageInterface {
  const data = new Map<string, { value: any; metadata: { ttl: number } }>();

  return {
    get: async (key: string) => {
      const item = data.get(key);

      if (item) {
        if (item.metadata.ttl < Date.now()) {
          data.delete(key);
          return null;
        }

        return item.value;
      }
      return null;
    },
    delete: async (key: string) => {
      data.delete(key);
    },
    put: async (
      key: string,
      value: StoredResource,
      options: { expirationTtl?: number; metadata?: { ttl?: number } }
    ) => {
      options.metadata = options.metadata || {};
      if (options.expirationTtl && !options.metadata.ttl) {
        options.metadata.ttl = Date.now() + options.expirationTtl;
      }
      if (!options.metadata.ttl) {
        options.metadata.ttl = Date.now() + 1000 * 60 * 60 * 24 * 365; // 1 year
      }
      data.set(key, { value, metadata: options.metadata as any });
    },
    getWithMetadata: async <T>(key: string) => {
      const item = data.get(key);

      if (item) {
        if (item.metadata.ttl < Date.now()) {
          data.delete(key);
          return { value: null, metadata: null };
        }

        return { value: item.value, metadata: item.metadata as T };
      }
      return { value: null, metadata: null };
    },
  };
}
