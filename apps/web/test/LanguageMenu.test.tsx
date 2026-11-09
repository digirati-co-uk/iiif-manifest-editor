import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { LanguageMenu, type LanguageMenuProps } from "../src/components/site/LanguageMenu";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
const roots: { unmount(): void }[] = [];
afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.innerHTML = "";
});

const labels: LanguageMenuProps["labels"] = {
  interfaceLanguage: "Interface language",
  availableLanguages: "Available languages",
  loading: "Loading…",
  searchLanguages: "Search languages",
  noLanguages: "No matching languages",
  moreOptions: (language) => `More options for ${language}`,
};
const variants = [
  { id: "standard", label: "Standard wording" },
  { id: "plain", label: "Plain wording" },
];

async function mount(props: Partial<LanguageMenuProps> = {}) {
  const onSelect = vi.fn();
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () =>
    root.render(
      <LanguageMenu
        locale="en-GB"
        activeVariant="standard"
        options={[
          { id: "en-GB", variants },
          { id: "nl", variants },
        ]}
        onSelect={onSelect}
        labels={labels}
        {...props}
      />
    )
  );
  const trigger = container.querySelector("button")!;
  await act(async () => trigger.click());
  return { onSelect, trigger };
}
// Collapsed variant lists stay in the DOM (hidden), so only look at buttons a user could reach.
const byText = (text: string) =>
  [...document.querySelectorAll<HTMLElement>("[role=dialog] button")].find(
    (b) => b.textContent?.includes(text) && !b.closest("[hidden]")
  )!;

it("is a glyph-only trigger that lists languages by native name", async () => {
  const { trigger } = await mount();
  expect(trigger.textContent).toBe("");
  expect(trigger.getAttribute("aria-label")).toBe("Interface language: English (United Kingdom)");
  expect(byText("Nederlands").querySelector("[lang]")?.getAttribute("lang")).toBe("nl");
});

it("selects a language while keeping the current variant", async () => {
  const { onSelect } = await mount();
  await act(async () => byText("Nederlands").click());
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({ locale: "nl" });
});

it("reveals variants behind a caret and selects language and variant together", async () => {
  const { onSelect } = await mount();
  const caret = document.querySelector<HTMLElement>('[aria-label="More options for Nederlands"]')!;
  expect(caret.getAttribute("aria-expanded")).toBe("false");
  await act(async () => caret.click());
  expect(caret.getAttribute("aria-expanded")).toBe("true");
  await act(async () => byText("Plain wording").click());
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({ locale: "nl", variant: "plain" });
});

it("shows no caret when a language has a single variant, and does not re-select the current choice", async () => {
  const { onSelect } = await mount({ options: [{ id: "en-GB" }, { id: "nl" }] });
  expect(document.querySelector("[role=dialog] [aria-expanded]")).toBeNull();
  await act(async () => byText("English").click());
  expect(onSelect).not.toHaveBeenCalled();
});

it("adds search once the list is long", async () => {
  const ids = ["en-GB", "nl", "fr", "de", "es", "it", "pt", "cy", "pl", "sv"];
  await mount({ options: ids.map((id) => ({ id })) });
  const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
  expect(search).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(search, "neder");
    search.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(document.querySelectorAll("ul[aria-label] > li")).toHaveLength(1);
});

it("moves past collapsed wording choices when navigating language rows with the keyboard", async () => {
  await mount();
  const first = byText("English");
  const caret = first.parentElement!.querySelector<HTMLButtonElement>("[aria-controls]")!;
  await act(async () => first.focus());
  await act(async () => first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
  expect(document.activeElement).toBe(caret);
  await act(async () => caret.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
  expect(document.activeElement).toBe(byText("Nederlands"));
  await act(async () => caret.click());
  await act(async () => caret.focus());
  await act(async () => caret.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
  expect(document.activeElement?.textContent).toBe("Standard wording");
  expect(document.activeElement).not.toBe(first);
});

it("distinguishes regional languages by their full native display names", async () => {
  await mount({ options: [{ id: "en-GB" }, { id: "en-US" }] });
  const names = [...document.querySelectorAll('[role="dialog"] button [lang]')].map((span) => span.textContent);
  expect(new Set(names).size).toBe(2);
  expect(names.some((name) => name?.includes("United Kingdom"))).toBe(true);
  expect(names.some((name) => name?.includes("United States"))).toBe(true);
});
