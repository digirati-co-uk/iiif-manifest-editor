import { Vault } from "@iiif/helpers/vault";
import { Preview, PreviewConfiguration, PreviewHandler } from "../PreviewContext.types";
import invariant from "tiny-invariant";

type IIIFPreviewResponse = {
  location: string;
  updateLocation?: string;
  deleteLocation?: string;
  expirationTtl: number;
};

export class IIIFPreviewService implements PreviewHandler {
  id: string;
  label: string;
  type = "iiif-preview-service";
  focusable = false;

  private readonly serviceUrl: string;
  private readonly cache: Record<string, IIIFPreviewResponse & { time: number }> = {};

  constructor({ id, config, label }: PreviewConfiguration<{ url: string }>) {
    this.id = id;
    this.label = label;
    this.serviceUrl = config.url;
  }

  getRequires(): string[] {
    return [];
  }

  getProvides(): string[] {
    return ["readOnlyManifest"];
  }

  async isPreviewValid(instanceId: string, instance: Preview): Promise<boolean> {
    if (!!this.cache[instanceId]) {
      return true;
    }

    if (!instance || !instance.data || !instance.data.readOnlyManifest) {
      return false;
    }

    const urlToCheck = instance.data.readOnlyManifest;
    try {
      const resp = await fetch(urlToCheck, {
        cache: "no-cache",
      });
      return resp.ok;
    } catch (e) {
      return false;
    }
  }

  async createPreview(instanceId: string, resource: { id: string; type: string }, vault: Vault): Promise<Preview> {
    const manifest = vault.toPresentation3(resource as any);
    const response = await fetch(this.serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "*",
      },
      body: JSON.stringify(manifest),
    });

    invariant(response.ok, "Unknown error creating preview");

    const json = await response.json();

    invariant(json.location, "Missing IIIF location while creating preview");

    this.cache[instanceId] = { ...json, time: Date.now() };

    return {
      id: this.id,
      type: "external-manifest-preview",
      data: {
        readOnlyManifest: `${json.location}/${Date.now()}`,
      },
    };
  }

  async focus() {
    // no op.
  }

  async updatePreview(instanceId: string, resource: { id: string; type: string }, vault: Vault): Promise<Preview> {
    const cached = this.cache[instanceId];
    if (!cached || Date.now() > cached.expirationTtl + cached.time || !cached.updateLocation) {
      return this.createPreview(instanceId, resource, vault);
    }

    const updateUrl = cached.updateLocation;
    const manifest = vault.toPresentation3(resource as any);

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "*",
      },
      body: JSON.stringify(manifest),
    });

    invariant(response.ok, "Unknown error updating preview");

    const json = await response.json();

    invariant(json.location);

    if (json.updateLocation) {
      cached.updateLocation = json.updateLocation;
    }

    const readOnlyManifest = `${json.location}/${Date.now()}`;

    // Make a fetch, fill the cache (preview may not)
    await fetch(readOnlyManifest, {
      cache: "no-cache",
    });

    return {
      id: this.id,
      type: "external-manifest-preview",
      data: {
        readOnlyManifest: `${json.location}/${Date.now()}`,
      },
    };
  }

  async deletePreview(id: string): Promise<void> {
    const cached = this.cache[id];
    if (cached && cached.deleteLocation) {
      try {
        await fetch(cached.deleteLocation, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Origin: "*",
          },
        });
      } catch (e) {
        // no-op, we tried.
      }
    }
  }
}
