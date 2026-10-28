import { expect, test } from "@playwright/test";

const cookieName = "manifest-editor-ui";

test("server and hydration use the permitted saved interface choice", async ({ page, context, baseURL }) => {
  await context.addCookies([
    {
      name: cookieName,
      value: encodeURIComponent(JSON.stringify({ version: 1, locale: "nl", profile: "plain" })),
      url: baseURL!,
    },
  ]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|did not match|server rendered/i.test(message.text()))
      errors.push(message.text());
  });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(await response!.text()).toMatch(/<html[^>]*lang="nl"/);
  await expect(page.getByRole("button", { name: /Interfacetaal/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Documentatie", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("header selection survives reload and fits a narrow header", async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  const header = page.locator("header").first();
  for (const control of await header.locator("a, button").all()) {
    if (!(await control.isVisible())) continue;
    const box = await control.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(321);
  }
  const switcher = page.getByRole("button", { name: /Interface language/ });
  await switcher.focus();
  await page.keyboard.press("ArrowDown");
  await page.getByRole("option", { name: "Nederlands", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect
    .poll(async () => {
      const cookie = (await context.cookies()).find((item) => item.name === cookieName);
      return cookie ? JSON.parse(decodeURIComponent(cookie.value)).locale : undefined;
    })
    .toBe("nl");
  const response = await page.reload();
  expect(await response!.text()).toMatch(/<html[^>]*lang="nl"/);
  await expect(page.getByRole("button", { name: /Interfacetaal/ })).toBeVisible();
});
