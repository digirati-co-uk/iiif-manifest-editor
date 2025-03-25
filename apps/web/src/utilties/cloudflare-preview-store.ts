import type { StorageInterface, StoredResource } from "@manifest-editor/iiif-preview-server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import superjson from "superjson";

export function createCloudflarePreviewStore(): StorageInterface {
  const getPreviewKv = () => getCloudflareContext().env.PREVIEW_KV;

  return {
    get: async (key: string) => {
      const item = await getPreviewKv().getWithMetadata<{ ttl?: number }>(key);

      if (item.value === null) {
        return null;
      }

      return superjson.parse(item.value);
    },
    delete: async (key: string) => {
      await getPreviewKv().delete(key);
    },
    put: async (
      key: string,
      value: StoredResource,
      options: { expirationTtl?: number; metadata?: { ttl?: number } },
    ) => {
      options.metadata = options.metadata || {};
      if (options.expirationTtl && !options.metadata.ttl) {
        options.metadata.ttl = Date.now() + options.expirationTtl;
      }
      if (!options.metadata.ttl) {
        options.metadata.ttl = Date.now() + 1000 * 60 * 60 * 24 * 7; // 1 week
      }

      const serialisedValue = superjson.stringify(value);

      await getPreviewKv().put(key, serialisedValue, options);
    },
    getWithMetadata: async <T>(key: string) => {
      const { metadata, value } = await getPreviewKv().getWithMetadata<T>(key);
      return {
        metadata,
        value: value ? superjson.parse(value) : null,
      };
    },
  };
}
