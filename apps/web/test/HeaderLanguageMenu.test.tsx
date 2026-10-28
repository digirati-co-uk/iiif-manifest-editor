import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { EditorI18nProvider, useEditorI18n } from "@manifest-editor/i18n";
import { createWebI18n, WebI18nProvider } from "../src/i18n/WebI18nProvider";
import { parseWebUiPreferences, UI_PREFERENCES_COOKIE } from "../src/i18n/policy";
import { HeaderLanguageMenu } from "../src/components/site/HeaderLanguageMenu";
import SiteLayout from "../src/app/(main)/(site)/layout";

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
  document.cookie = `${UI_PREFERENCES_COOKIE}=; Max-Age=0; Path=/`;
});
function mount() {
  const node = document.createElement("div");
  document.body.appendChild(node);
  const root = createRoot(node);
  roots.push(root);
  return { root, node };
}
const row = (locale: string) =>
  document.querySelector<HTMLElement>(`[role="dialog"] button [lang="${locale}"]`)!.closest("button")!;
const visibleChoice = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(
    (button) => button.textContent === text && !button.closest("[hidden]")
  )!;

it("uses one menu in the real site header, loads all languages and applies a language/wording choice without remounting a draft", async () => {
  let controls!: ReturnType<typeof useEditorI18n>;
  let mounts = 0;
  function Draft() {
    controls = useEditorI18n();
    const [value] = useState(() => {
      mounts++;
      return "Teitl Cymraeg";
    });
    return <input aria-label="Authored title" readOnly value={value} />;
  }
  const { root, node } = mount();
  await act(async () =>
    root.render(
      <WebI18nProvider>
        <SiteLayout>
          <Draft />
        </SiteLayout>
      </WebI18nProvider>
    )
  );
  const input = node.querySelector("input");
  const header = node.querySelector("header")!;
  expect(header.querySelectorAll("button")).toHaveLength(1);
  expect(header.querySelector("select")).toBeNull();
  const trigger = header.querySelector<HTMLButtonElement>("button")!;
  await act(async () => trigger.click());
  expect(document.querySelectorAll('[role="dialog"] ul[aria-label] > li')).toHaveLength(18);
  await act(async () => row("nl").parentElement!.querySelector<HTMLButtonElement>("[aria-controls]")!.click());
  await act(async () => visibleChoice("Plain wording").click());
  expect(controls).toMatchObject({ locale: "nl", profile: "plain" });
  expect(document.documentElement.lang).toBe("nl");
  expect(node.querySelector("input")).toBe(input);
  expect(input?.value).toBe("Teitl Cymraeg");
  expect(mounts).toBe(1);
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${UI_PREFERENCES_COOKIE}=`))
    ?.split("=")[1];
  expect(parseWebUiPreferences(cookie)).toEqual({ locale: "nl", profile: "plain" });
  expect(header.textContent).toContain("Documentatie");
  await act(async () => trigger.click());
  expect(row("nl").textContent).toContain("Eenvoudig woordgebruik");
  expect(document.querySelector('[role="dialog"] input')?.getAttribute("aria-label")).toBe("Talen zoeken");
});

it("announces rejected host language changes and keeps the same usable trigger", async () => {
  const runtime = createWebI18n();
  const { root, node } = mount();
  await act(async () =>
    root.render(
      <EditorI18nProvider
        instance={runtime}
        locale="en-GB"
        onLocaleChange={async () => {
          throw new Error("Rejected");
        }}
      >
        <HeaderLanguageMenu />
      </EditorI18nProvider>
    )
  );
  const trigger = node.querySelector<HTMLButtonElement>("button")!;
  await act(async () => trigger.click());
  await act(async () => row("nl").click());
  expect(runtime.getSnapshot().locale).toBe("en-GB");
  expect(node.textContent).toContain("The interface settings could not be changed. Try again.");
  expect(node.querySelector("button")).toBe(trigger);
  expect(trigger.disabled).toBe(false);
  expect(trigger.getAttribute("aria-disabled")).toBe("false");
});

it("keeps focus and blocks reopening while a controlled language request is pending", async () => {
  let rejectRequest!: (reason: unknown) => void;
  const runtime = createWebI18n();
  const { root, node } = mount();
  await act(async () =>
    root.render(
      <EditorI18nProvider
        instance={runtime}
        locale="en-GB"
        onLocaleChange={() =>
          new Promise<void>((_, reject) => {
            rejectRequest = reject;
          })
        }
      >
        <HeaderLanguageMenu />
      </EditorI18nProvider>
    )
  );
  const trigger = node.querySelector<HTMLButtonElement>("button")!;
  await act(async () => trigger.focus());
  await act(async () => trigger.click());
  await act(async () => row("nl").click());
  expect(trigger.getAttribute("aria-disabled")).toBe("true");
  expect(trigger.disabled).toBe(false);
  expect(trigger.tabIndex).toBe(0);
  await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  await act(async () => trigger.click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  await act(async () => rejectRequest(new Error("Rejected")));
  expect(trigger.getAttribute("aria-disabled")).toBe("false");
  expect(runtime.getSnapshot().locale).toBe("en-GB");
});
