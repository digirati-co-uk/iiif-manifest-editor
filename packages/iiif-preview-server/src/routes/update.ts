import { Vault } from "@iiif/helpers/vault";
import invariant from "tiny-invariant";
import {
  decrypt,
  encrypt,
  generateId,
  getBaseUrl,
  getHeaders,
  getKeys,
} from "../helpers";
import { type RouteConfig, StorageInterface } from "../types";

export async function updateRoute(
  request: Request,
  params: { keys: string; key3: string },
  config: RouteConfig,
): Promise<Response> {
  const {
    storage,
    baseUrl,
    encryptedEnabled,
    expirationTtl,
    partLength,
    rotatingUpdateKey,
    updateKeyLength,
  } = config;
  const corsHeaders = getHeaders(request);
  const { key1, key2, key3, storeKey } = getKeys(
    params.keys,
    params.key3,
    partLength,
    encryptedEnabled,
  );

  const object = await storage.get(storeKey);

  invariant(
    object && object.update && object.manifest && object.delete,
    "Invalid Object",
  );

  const keyToCompare = object.update;
  if (encryptedEnabled) {
    const update = await decrypt(keyToCompare, key3);
    invariant(update === key2, "Invalid update key");
  } else {
    invariant(keyToCompare === key3, "Invalid update key");
  }

  const body: any = await request.json();
  const id = body.id || body["@id"];
  const type = body.type || body["@type"];
  const vault = new Vault();
  const manifest = await vault.loadManifest(id, body);
  const newKey3 = rotatingUpdateKey ? generateId(updateKeyLength) : key3;

  invariant(!!manifest, "Invalid Manifest");
  invariant(
    type === "Manifest" ||
      type === "Collection" ||
      type === "sc:Manifest" ||
      type === "sc:Collection",
    "Invalid Type",
  );

  const data = vault.toPresentation3(manifest);
  const manifestJson = encryptedEnabled
    ? await encrypt(JSON.stringify(data), key1)
    : JSON.stringify(data);

  await storage.put(
    storeKey,
    {
      update: encryptedEnabled ? await encrypt(key2, newKey3) : newKey3,
      delete: object.delete,
      manifest: manifestJson,
      type,
    },
    {
      expirationTtl,
      metadata: { ttl: Date.now() + expirationTtl },
    },
  );

  // POST /edit/:id -> Response<{ location: string; updateLocation: string; }>
  return new Response(
    JSON.stringify({
      location: `${baseUrl}p3/${key1}${key2}`,
      updateLocation: `${baseUrl}update/${key1}${key2}/${newKey3}`,
      expirationTtl,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}
