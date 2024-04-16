import { Vault } from "@iiif/helpers/vault";
import { Preview, PreviewHandler } from "../PreviewContext.types";

export class ExternalManifestUrlPreview implements PreviewHandler {
  id: string;
  label: string;
  type = "external-manifest-preview";
  focusable = true;

  private readonly serviceUrl: string;
  private readonly windows: Record<string, { location: string; window: Window | null }> = {};

  constructor({ id, config, label }: { id: string; type?: string; label: string; config: { url: string } }) {
    this.id = id;
    this.label = label;
    this.serviceUrl = config.url;
  }

  isPreviewValid(instanceId: string): boolean {
    const current = this.windows[instanceId];
    if (current && current.window && !current.window.closed) {
      return true;
    }

    return false;
  }

  getRequires(): string[] {
    return ["readOnlyManifest"];
  }

  getProvides(): string[] {
    return [];
  }

  async createPreview(
    instanceId: string,
    resource: { id: string; type: string },
    vault: Vault,
    ctx: { readOnlyManifest: string }
  ): Promise<Preview> {
    // @todo change this to be a template, with more features.
    const location = `${this.serviceUrl}`
      .replace(/\{manifestId}/, ctx.readOnlyManifest)
      .replace(/\{time}/, `${Date.now()}`);
    const opened = window.open(location, this.id);

    this.windows[instanceId] = { location, window: opened };

    return {
      id: this.id,
      type: "external-manifest-preview",
      data: { url: location },
    };
  }

  async focus(instanceId: string) {
    const found = this.windows[instanceId];

    if (found && found.window) {
      found.window.focus();
    }
  }

  async updatePreview(
    instanceId: string,
    resource: { id: string; type: string },
    vault: Vault,
    ctx: { readOnlyManifest: string }
  ): Promise<Preview | null> {
    const found = this.windows[instanceId];

    if (found) {
      try {
        found.window?.close();
      } catch {}
    }

    return this.createPreview(instanceId, resource, vault, ctx);
  }

  async deletePreview(id: string): Promise<void> {
    const found = this.windows[id];
    if (found && found.window) {
      found.window.close();
      delete this.windows[id];
    }
  }
}
