import { expect, type Page, Locator, } from "@playwright/test";

export class Homepage {
  readonly page: Page;
  readonly createNewManifestButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Homepage buttons.
    this.createNewManifestButton = page.getByRole("button", { name: "Create new manifest" });
  }

  async goto() {
    await this.page.goto("/");

    await expect(this.page).toHaveTitle(/Manifest Editor/);
  }

}
