import { expect, type Page, Locator } from "@playwright/test";
import type { resources } from "@manifest-editor/editor-api";

export class ManifestPresetPage {
  readonly page: Page;
  readonly manifestHeading: Locator;
  #identifier: string | null;
  readonly addMetadataButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.manifestHeading = this.page.locator("h2[title]");
    this.addMetadataButton = page.getByRole("button", {
      name: "Add metadata item",
    });
    this.#identifier = null;
  }

  async waitForPage() {
    await this.page.waitForURL(/editor\/(.*)/);
  }

  async openPlugins() {
    await this.page.getByRole("button", { name: "Settings", exact: true }).click();
    await this.page.getByRole("button", { name: "Plugins", exact: true }).click();
    await expect(this.page.getByRole("heading", { name: "Plugins", level: 2 })).toBeVisible();
  }

  get identifier() {
    if (this.#identifier === null) {
      throw new Error("Identifier not set, call `waitForIdentifier()`");
    }
    return this.#identifier;
  }

  getMetadataFieldsetByIndex(key: number) {
    return this.page.getByRole("group", { name: `Metadata item ${key + 1}` });
  }

  getMetadataEditButtonByIndex(key: number) {
    return this.getMetadataFieldsetByIndex(key).getByRole("button", {
      name: `Edit metadata item ${key + 1}`,
    });
  }

  getMetadataDoneButtonByIndex(key: number) {
    return this.getMetadataFieldsetByIndex(key).getByRole("button", {
      name: `Done editing metadata item ${key + 1}`,
    });
  }

  getMetadataDragHandleByIndex(key: number) {
    return this.getMetadataFieldsetByIndex(key).getByRole("button", {
      name: `Reorder metadata item ${key + 1}`,
    });
  }

  getMetadataActionMenuByIndex(key: number) {
    return this.getMetadataFieldsetByIndex(key).getByRole("button", {
      name: `Metadata item ${key + 1} actions`,
    });
  }

  async waitForIdentifier() {
    await this.page.getByRole("tab", { name: "Technical", exact: true }).click();
    const manifestIdentifier = await this.page.getByRole("textbox", {
      name: "Identifier",
    });
    await expect(manifestIdentifier).toHaveValue(/https?:\/\/.*/);
    this.#identifier = await manifestIdentifier.inputValue();
  }

  resolveContainer<
    Type extends keyof (typeof resources)["supported"],
    Field extends (typeof resources)["supported"][Type]["all"][number],
  >(type: Type, field: Field) {
    return this.page.locator(`[id='container_${this.identifier}_${type}_${field}']`);
  }

  async goto() {
    await this.page.goto("/");

    await expect(this.page).toHaveTitle(/Manifest Editor/);
  }
}
