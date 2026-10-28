import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { LanguageSwitcher, type LanguageSwitcherProps } from "../src/components/site/LanguageSwitcher";
import { HeaderLanguageSwitcher } from "../src/components/site/HeaderLanguageSwitcher";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createWebI18n } from "../src/i18n/WebI18nProvider";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
// jsdom lacks CSS.escape; the library queries our locale IDs in quoted attribute selectors.
vi.stubGlobal("CSS", { escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`) });
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
Element.prototype.scrollIntoView = () => {};
const roots: { unmount(): void }[] = [];
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
});

const labels = { interfaceLanguage: "Interfacetaal", availableLanguages: "Beschikbare talen", loading: "Laden…" };
function mount(overrides: Partial<LanguageSwitcherProps> = {}) {
  const onLocaleChange = vi.fn();
  const props = { locale: "en-GB", availableLocales: ["en-GB", "nl"], onLocaleChange, labels, ...overrides };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  return {
    container,
    onLocaleChange,
    async render(next: Partial<LanguageSwitcherProps> = {}) {
      await act(async () => {
        root.render(<LanguageSwitcher {...props} {...next} />);
      });
    },
  };
}
async function key(element: HTMLElement, key: string) {
  await act(async () => {
    element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
}

it("offers native language choices through the keyboard and localizes accessible labels", async () => {
  const ui = mount();
  await ui.render();
  const button = ui.container.querySelector("button")!;
  await act(async () => button.focus());
  await key(button, "ArrowDown");
  const list = document.querySelector('[role="listbox"]')!;
  expect(list).not.toBeNull();
  expect(list.getAttribute("aria-label")).toBe(labels.availableLanguages);
  const dutch = [...list.querySelectorAll<HTMLElement>('[role="option"]')].find((el) =>
    el.textContent?.includes("Nederlands")
  )!;
  expect(dutch.querySelector("[lang]")?.getAttribute("lang")).toBe("nl");
  await act(async () => dutch.click());
  expect(ui.onLocaleChange).toHaveBeenCalledExactlyOnceWith("nl");
  const accessibleLabels = (button.getAttribute("aria-labelledby") || "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent);
  expect(accessibleLabels).toContain(labels.interfaceLanguage);
  await ui.render({ locale: "nl" });
  expect(button.querySelector('[lang="nl"]')?.textContent).toBe("Nederlands");
});

it("retains trigger focus while loading and blocks further selection until it completes", async () => {
  const ui = mount();
  await ui.render();
  const button = ui.container.querySelector("button")!;
  await act(async () => button.focus());
  await ui.render({ loading: true });
  expect(document.activeElement).toBe(button);
  expect(button.disabled).toBe(false);
  expect(button.tabIndex).toBe(0);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(ui.container.querySelector("output")?.textContent).toBe(labels.loading);
  await key(button, "ArrowDown");
  expect(document.querySelector('[role="listbox"]')).toBeNull();
  expect(ui.onLocaleChange).not.toHaveBeenCalled();
  await ui.render({ loading: false });
  await key(button, "ArrowDown");
  expect(document.querySelector('[role="listbox"]')).not.toBeNull();
});

it("keeps regional locale variants distinguishable and a single available locale inert", async () => {
  const regional = mount({ availableLocales: ["en-GB", "en-US"] });
  await regional.render();
  const button = regional.container.querySelector("button")!;
  await act(async () => button.focus());
  await key(button, "ArrowDown");
  const choices = [...document.querySelectorAll('[role="option"]')].map((el) => el.textContent);
  expect(new Set(choices).size).toBe(2);
  expect(choices).toHaveLength(2);
  await key(document.activeElement as HTMLElement, "Escape");
  const single = mount({ locale: "nl", availableLocales: ["nl"] });
  await single.render();
  const unavailable = single.container.querySelector("button")!;
  expect(unavailable.disabled).toBe(true);
  await key(unavailable, "ArrowDown");
  expect(document.querySelector('[role="listbox"]')).toBeNull();
  expect(single.onLocaleChange).not.toHaveBeenCalled();
});

it("announces a rejected asynchronous host request and leaves the trigger usable", async () => {
  const runtime = createWebI18n();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () =>
    root.render(
      <EditorI18nProvider
        instance={runtime}
        locale="en-GB"
        onLocaleChange={async () => {
          throw new Error("Host rejected selection");
        }}
      >
        <HeaderLanguageSwitcher />
      </EditorI18nProvider>
    )
  );
  const button = container.querySelector("button")!;
  await act(async () => button.focus());
  await key(button, "ArrowDown");
  const dutch = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
    option.textContent?.includes("Nederlands")
  )!;
  await act(async () => dutch.click());
  expect(container.textContent).toContain("The interface settings could not be changed. Try again.");
  expect(runtime.getSnapshot().locale).toBe("en-GB");
  expect(button.disabled).toBe(false);
  expect(button.getAttribute("aria-disabled")).toBe("false");
});
