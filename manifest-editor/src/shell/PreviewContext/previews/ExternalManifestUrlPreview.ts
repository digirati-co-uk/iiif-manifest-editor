import { EditorProject } from "../../ProjectContext/ProjectContext.types";
import { Vault } from "@iiif/helpers/vault";
import { Preview } from "../../ProjectContext/types/Preview";
import { PreviewConfiguration, PreviewHandler } from "../PreviewContext.types";

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

  isPreviewValid(project: EditorProject): boolean {
    const current = this.windows[project.id];
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

  async createPreview(project: EditorProject, vault: Vault, ctx: { readOnlyManifest: string }): Promise<Preview> {
    // @todo change this to be a template, with more features.
    const location = `${this.serviceUrl}`
      .replace(/\{manifestId}/, ctx.readOnlyManifest)
      .replace(/\{time}/, `${Date.now()}`);
    const opened = window.open(location, this.id);

    this.windows[project.id] = { location, window: opened };

    return {
      id: this.id,
      type: "external-manifest-preview",
      data: { url: location },
    };
  }

  async focus(project: EditorProject) {
    const found = this.windows[project.id];

    if (found && found.window) {
      found.window.focus();
    }
  }

  async updatePreview(
    project: EditorProject,
    vault: Vault,
    ctx: { readOnlyManifest: string }
  ): Promise<Preview | null> {
    const found = this.windows[project.id];

    return this.createPreview(project, vault, ctx);
  }

  async deletePreview(id: string): Promise<void> {
    const found = this.windows[id];
    if (found && found.window) {
      found.window.close();
      delete this.windows[id];
    }
  }
}
