import { getStore } from "@netlify/blobs";
import { StorageInterface } from "../types";

export function createNetlifyStore(
  config: {
    defaultTtl?: number;
    netlifyStoreName?: string;
  } = {}
): StorageInterface {
  const manifests = getStore(config.netlifyStoreName || "preview-manifests");

  return {
    get: async (key: string) => {
      const resource = await manifests.getWithMetadata(key);
      const metadata = (resource?.metadata || {}) as any;
      const item = resource?.data ? JSON.parse(resource.data) : null;

      if (item) {
        if (metadata?.ttl < Date.now()) {
          manifests.delete(key);
          return null;
        }

        return item.value;
      }
      return null;
    },
    delete: async (key: string) => {
      await manifests.delete(key);
    },
    purgeCache: async () => {
      // @todo.
    },
    getWithMetadata: async <T>(key: string) => {
      const item = await manifests.getWithMetadata(key);
      if (item) {
        const metadata = item.metadata as { ttl?: number };
        if (metadata?.ttl && metadata?.ttl < Date.now()) {
          await manifests.delete(key);
          return { value: null, metadata: null };
        }
        return { value: JSON.parse(item.data), metadata: item.metadata as T };
      }
      return { value: null, metadata: null };
    },
    put: async (key: string, value: any, options: { expirationTtl?: number; metadata?: { ttl?: number } }) => {
      options.metadata = options.metadata || {};
      if (options.expirationTtl && !options.metadata.ttl) {
        options.metadata.ttl = Date.now() + options.expirationTtl;
      }
      if (!options.metadata.ttl) {
        options.metadata.ttl = config.defaultTtl || Date.now() + 1000 * 60 * 60 * 24 * 2; // 48 hours
      }
      await manifests.set(key, JSON.stringify(value), options);
    },
  };
}
