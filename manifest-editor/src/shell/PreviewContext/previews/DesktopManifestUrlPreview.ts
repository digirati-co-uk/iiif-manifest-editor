import { EditorProject } from "../../ProjectContext/ProjectContext.types";
import { Vault } from "@iiif/vault";
import { Preview } from "../../ProjectContext/types/Preview";
import { PreviewConfiguration, PreviewHandler } from "../PreviewContext.types";
import { WebviewWindow } from "@tauri-apps/api/window";
import slugify from "slugify";

export class DesktopManifestUrlPreview implements PreviewHandler {
  id: string;
  label: string;
  type = "external-manifest-preview";
  focusable = true;

  private readonly serviceUrl: string;
  private readonly windows: Record<string, { location: string; window: WebviewWindow | null }> = {};

  constructor({ id, config, label }: { id: string; type?: string; label: string; config: { url: string } }) {
    this.id = id;
    this.label = label;
    this.serviceUrl = config.url;
  }

  isPreviewValid(project: EditorProject): boolean {
    const current = this.windows[project.id];
    console.log("isPreviewValid?", current);
    try {
      if (current && current.window) {
        return true;
      }
    } catch (e) {
      return false;
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
    const location = `${this.serviceUrl}`
      .replace(/\{manifestId}/, ctx.readOnlyManifest)
      .replace(/\{time}/, `${Date.now()}`);
    const opened = new WebviewWindow(slugify(this.label), {
      url: location,
      width: 800,
      height: 600,
    });

    await opened.once("tauri://close-requested", () => {
      this.deletePreview(project.id);
    });

    await new Promise((resolve, reject) => {
      opened.once("tauri://created", resolve);
      opened.once("tauri://error", (err) => {
        if (err.id === -1) {
          this.focus(project);
        }
        reject();
      });
    });

    this.windows[project.id] = { location, window: opened };

    return {
      id: this.id,
      type: "external-manifest-preview",
      data: { url: location },
    };
  }

  async focus(project: EditorProject) {
    console.log("focus?");
    const found = this.windows[project.id];

    if (found && found.window) {
      await found.window.setFocus();
    }
  }

  async updatePreview(
    project: EditorProject,
    vault: Vault,
    ctx: { readOnlyManifest: string }
  ): Promise<Preview | null> {
    const found = this.windows[project.id];

    if (found && found.window) {
      await this.deletePreview(project.id);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("new preview?");

    return this.createPreview(project, vault, ctx);
  }

  async deletePreview(id: string): Promise<void> {
    const found = this.windows[id];
    if (found && found.window) {
      await found.window.close();
      delete this.windows[id];
    }
  }
}
