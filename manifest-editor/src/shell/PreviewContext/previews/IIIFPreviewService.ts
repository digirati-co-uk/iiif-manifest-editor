import { EditorProject } from "../../ProjectContext/ProjectContext.types";
import { Preview } from "../../ProjectContext/types/Preview";
import { Vault } from "@iiif/vault";
import { PreviewConfiguration, PreviewHandler } from "../PreviewContext.types";
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

  isPreviewValid(project: EditorProject): boolean {
    return !!this.cache[project.id];
  }

  async createPreview(project: EditorProject, vault: Vault): Promise<Preview> {
    const manifest = vault.toPresentation3(project.resource);
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

    this.cache[project.id] = { ...json, time: Date.now() };

    return {
      id: this.id,
      type: "external-manifest-preview",
      data: {
        readOnlyManifest: json.location,
      },
    };
  }

  async focus() {
    // no op.
  }

  async updatePreview(project: EditorProject, vault: Vault): Promise<Preview> {
    const cached = this.cache[project.id];
    if (!cached || Date.now() > cached.expirationTtl + cached.time || !cached.updateLocation) {
      return this.createPreview(project, vault);
    }

    const updateUrl = cached.updateLocation;
    const manifest = vault.toPresentation3(project.resource);

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

    return {
      id: this.id,
      type: "external-manifest-preview",
      data: {
        readOnlyManifest: json.location,
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
