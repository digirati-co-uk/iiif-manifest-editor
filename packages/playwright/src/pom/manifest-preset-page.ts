import { expect, type Page, Locator, } from "@playwright/test";
import { resources } from "@manifest-editor/editor-api";

const meta = resources.supported.Manifest;

export class ManifestPresetPage {
  readonly page: Page;
  readonly manifestHeading: Locator;
  #identifier: string | null;
  readonly addMetadataButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.manifestHeading = this.page.getByRole("heading", { level: 2 });
    this.addMetadataButton = page.getByRole("button", { name: "Add metadata item" });
    this.#identifier = null;
  }

  async waitForPage() {
    await this.page.waitForURL(/editor\/(.*)/);
  }

  get identifier() {
    if (this.#identifier === null) {
      throw new Error("Identifier not set, call `waitForIdentifier()`");
    }
    return this.#identifier;
  }

  getMetadataFieldsetByIndex(key: number) {
    return this.page.getByRole("group", { name: `Metadata item ${key}` });
  }

  async waitForIdentifier() {
    const manifestIdentifier = await this.page.getByRole("textbox", { name: "Identifier" });
    expect(manifestIdentifier).toHaveValue(/https?:\/\/.*/);
    this.#identifier = await manifestIdentifier.inputValue();
  }

  resolveContainer<
    Type extends keyof typeof resources['supported'],
    Field extends typeof resources['supported'][Type]['all'][number],
  >(type: Type, field: Field) {
    return this.page.locator(`[id='container_${this.identifier}_${type}_${field}']`);
  }

  async goto() {
    await this.page.goto("/");

    await expect(this.page).toHaveTitle(/Manifest Editor/);
  }

}
