import invariant from "tiny-invariant";
import { encryptedEnabled, partLength } from "../config";
import { decrypt, getHeaders, getKeys } from "../helpers";
import type { RouteConfig } from "../types";

export async function deleteRoute(
  request: Request,
  params:
    | Promise<{ keys: string; key3: string }>
    | { keys: string; key3: string },
  config: RouteConfig,
): Promise<Response> {
  const { storage } = config;
  const awaitedParams = await params;
  const corsHeaders = getHeaders(request);
  const { key2, key3, storeKey } = getKeys(
    awaitedParams.keys,
    awaitedParams.key3,
    partLength,
    encryptedEnabled,
  );

  const object = await storage.get(storeKey);
  invariant(
    object?.update && object.manifest && object.delete,
    "Invalid Object",
  );

  const keyToCompare = object.delete;
  if (encryptedEnabled) {
    const update = await decrypt(keyToCompare, key3);
    invariant(update === key2, "Invalid update key");
  } else {
    invariant(keyToCompare === key3, "Invalid update key");
  }

  // DELETE /edit/:id -> Response<{ location: string; updateLocation: string; }>
  await storage.delete(storeKey);

  return new Response("Deleted", {
    status: 200,
    headers: corsHeaders,
  });
}
