import { Vault } from "@iiif/helpers/vault";
import invariant from "tiny-invariant";
import { encrypt, generateId, getHeaders } from "../helpers";
import type { RouteConfig } from "../types";

export async function storeRoute(request: Request, params: any, config: RouteConfig): Promise<Response> {
  const { storage, baseUrl, encryptedEnabled, expirationTtl, partLength, updateKeyLength } = config;
  const body: any = await request.json();
  const headers = getHeaders(request);

  invariant(body !== null, "Invalid Body");
  invariant(body["id"] || body["@id"], "Invalid or missing Identifier");

  const id = body.id || body["@id"];
  const type = body.type || body["@type"];

  invariant(
    type === "Manifest" || type === "Collection" || type === "sc:Manifest" || type === "sc:Collection",
    "Invalid Type",
  );

  const vault = new Vault();
  const manifest =
    type === "Manifest" || type === "sc:Manifest"
      ? await vault.loadManifest(id, body)
      : await vault.loadCollection(id, body);

  invariant(!!manifest, "Invalid Manifest");

  const key1 = generateId(partLength);
  const key2 = generateId(partLength);
  const key3 = generateId(updateKeyLength);
  const key4 = generateId(updateKeyLength);
  const storeKey = encryptedEnabled ? key1 : key1 + key2;

  const data = vault.toPresentation3(manifest);
  const manifestJson = encryptedEnabled ? await encrypt(JSON.stringify(data), key1) : JSON.stringify(data);

  await storage.put(
    storeKey,
    {
      update: encryptedEnabled ? await encrypt(key2, key3) : key3,
      delete: encryptedEnabled ? await encrypt(key2, key4) : key4,
      manifest: manifestJson,
      type: "manifest",
    },
    {
      expirationTtl, // 48 hours
      metadata: { ttl: Date.now() + expirationTtl * 1000 },
    },
  );

  // POST /store  Body<Manifest> -> Response<{ location: string; updateLocation: string }>
  return new Response(
    JSON.stringify({
      location: `${baseUrl}p3/${key1}${key2}`,
      updateLocation: `${baseUrl}update/${key1}${key2}/${key3}`,
      deleteLocation: `${baseUrl}delete/${key1}${key2}/${key4}`,
      expirationTtl,
    }),
    {
      status: 201,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    },
  );
}
