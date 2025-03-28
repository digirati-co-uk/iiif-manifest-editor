import type { NextRequest } from "next/server";
import invariant from "tiny-invariant";
import { getHeaders } from "../helpers";
import { deleteRoute } from "../routes/delete";
import { retrieveRoute } from "../routes/retrieve";
import { storeRoute } from "../routes/store";
import { updateRoute } from "../routes/update";
import { createMemoryStore } from "../stores/memory";
import type { Config, StorageInterface } from "../types";

// Create a Next.js router for the IIIF Preview Server
// Usage: create `app/iiif/[...slug]/route.js`
// import { createNextIIIFPreviewServerRoutes } from "@iiif/iiif-preview-server/next-app-router";
// export default createNextIIIFPreviewServerRoutes({ apiPath: "/iiif" });
// Routes:
// * POST /{BASE}/store - Store a manifest or collection
// * PUT /{BASE}/update/{id} - Update a manifest or collection
// * GET /{BASE}/p3/{id}/{key3} - Get a manifest or collection
// * DELETE /{BASE}/delete/{id}/{key3} - Delete a manifest or collection
export function createIIIFPreviewNextApiHandler({
  apiPath,
  validate,
  getStore,
  config,
  storage: customStorage,
}: {
  apiPath: string;
  validate?: (request: NextRequest) => Promise<boolean>;
  getStore?: (request: NextRequest) => StorageInterface;
  config?: Partial<Config>;
  storage?: StorageInterface;
}) {
  const storage = customStorage || createMemoryStore();
  const baseUrl = getBaseUrl() + apiPath + "/";
  const baseConfig: Config & { baseUrl: string } = {
    baseUrl,
    keyLength: 32,
    partLength: 16, // keyLength / 2
    updateKeyLength: 64,
    expirationTtl: 60 * 60 * 24 * 28, // 28 days
    encryptedEnabled: false,
    rotatingUpdateKey: true,
    accessControlAllowPrivateNetwork: false,
    ...config,
  };

  return {
    dynamic: "force-dynamic",
    async HEAD(request: NextRequest) {
      const headers = getHeaders(request);
      return new Response(null, {
        headers,
      });
    },
    async OPTIONS(request: NextRequest) {
      const didRequestPrivateNetwork = request.headers.get(
        "Access-Control-Request-Private-Network",
      );
      const headers = getHeaders(request, {
        accessControlAllowPrivateNetwork:
          didRequestPrivateNetwork === "true" &&
          baseConfig.accessControlAllowPrivateNetwork,
      });
      return new Response(null, {
        status: 200,
        headers,
      });
    },
    async GET(
      request: NextRequest,
      { params }: { params: { slug: string[] } },
    ) {
      const url = new URL(request.url);
      const baseUrl = new URL(baseConfig.baseUrl);

      if (url.hostname !== baseUrl.hostname) {
        baseUrl.hostname = url.hostname;
      }

      if (validate) {
        const valid = await validate(request);
        invariant(valid, "Unauthorized");
      }

      const [p3, id] = params.slug;
      invariant(p3 === "p3", "Invalid path");
      invariant(id, "Invalid resource");

      const config = {
        ...baseConfig,
        baseUrl: baseUrl.toString(),
        storage: getStore ? getStore(request) : storage,
      };

      return retrieveRoute(request, { keys: id }, config);
    },
    async POST(
      request: NextRequest,
      { params }: { params: { slug: string[] } },
    ) {
      const url = new URL(request.url);
      const baseUrl = new URL(baseConfig.baseUrl);

      if (url.hostname !== baseUrl.hostname) {
        baseUrl.hostname = url.hostname;
      }

      if (validate) {
        const valid = await validate(request);
        invariant(valid, "Unauthorized");
      }

      const [store] = params.slug;
      invariant(store === "store", "Invalid path");
      invariant(params.slug.length === 1, "Invalid path");

      const config = {
        ...baseConfig,
        baseUrl: baseUrl.toString(),
        storage: getStore ? getStore(request) : storage,
      };

      return storeRoute(request, {}, config);
    },
    async PUT(
      request: NextRequest,
      { params }: { params: { slug: string[] } },
    ) {
      const url = new URL(request.url);
      const baseUrl = new URL(baseConfig.baseUrl);

      if (url.hostname !== baseUrl.hostname) {
        baseUrl.hostname = url.hostname;
      }

      if (validate) {
        const valid = await validate(request);
        invariant(valid, "Unauthorized");
      }

      const [update, id, key3] = params.slug;
      invariant(update === "update", "Invalid path");
      invariant(id, "Invalid path");
      invariant(key3, "Invalid path");
      invariant(params.slug.length === 3, "Invalid path");

      const config = {
        ...baseConfig,
        baseUrl: baseUrl.toString(),
        storage: getStore ? getStore(request) : storage,
      };

      return updateRoute(request, { keys: id, key3 }, config);
    },
    async DELETE(
      request: NextRequest,
      { params }: { params: { slug: string[] } },
    ) {
      if (validate) {
        const valid = await validate(request);
        invariant(valid, "Unauthorized");
      }

      const [deletePath, id, key3] = params.slug;

      invariant(deletePath === "delete", "Invalid path");
      invariant(id, "Invalid path");
      invariant(key3, "Invalid path");
      invariant(params.slug.length === 3, "Invalid path");

      const config = {
        ...baseConfig,
        storage: getStore ? getStore(request) : storage,
      };

      return deleteRoute(request, { keys: id, key3 }, config);
    },
  };
}

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  const url = process.env.URL;

  if (url?.includes('localhost')) {
    return url;
  }

  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL;
  }

  if (process.env.URL) {
    // assume Netlify
    return process.env.URL;
  }
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
