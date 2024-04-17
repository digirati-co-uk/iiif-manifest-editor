import invariant from "tiny-invariant";
import { decrypt, getHeaders } from "../helpers";
import { RouteConfig } from "../types";

export async function retrieveRoute(
  request: Request,
  params: { keys: string },
  config: RouteConfig
): Promise<Response> {
  const { encryptedEnabled, partLength, storage } = config;
  const corsHeaders = getHeaders(request);

  const { keys } = params;
  const key1 = keys.slice(0, partLength);
  const key2 = keys.slice(partLength);
  const storeKey = encryptedEnabled ? key1 : key1 + key2;

  if (!key1 || !key2) {
    return new Response("Invalid identifier", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const resp = await storage.getWithMetadata<{ ttl: number }>(storeKey);

  invariant(resp && resp.value, "Item not found");

  const data = resp.value;

  invariant(data, "Item not found");

  const manifest = encryptedEnabled ? await decrypt(data.manifest, key1) : data.manifest;

  return new Response(manifest, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-Sandbox-Expires-In": `${Math.floor(((resp.metadata?.ttl || 0) - Date.now()) / 1000)}`,
    },
  });
}
