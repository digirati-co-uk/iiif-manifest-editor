import { EditorProject } from "../ProjectContext.types";
import { Preview } from "../types/Preview";
import { Vault } from "@iiif/vault";

class IIIFPreviewService {
  serviceUrl: string;
  cache: Record<string, { updateLocation: string; deleteLocation: string; location: string }> = {};

  constructor(config: { url: string }) {
    this.serviceUrl = config.url;
  }

  getRequires(): string[] {
    return [];
  }

  getProvides(): string[] {
    return ["readOnlyManifest"];
  }

  // 1. Create
  async createPreview(project: EditorProject, vault: Vault): Promise<Preview> {
    return {
      id: "https://example.org/preview/1234",
      type: "iiif-preview",
      data: {},
    };
  }

  // 2. Update
  async updatePreview(project: EditorProject, vault: Vault): Promise<Preview | null> {
    //

    return null; // null = did not update.
  }

  // 3. Delete
  async deletePreview(): Promise<void> {
    //
  }
}
