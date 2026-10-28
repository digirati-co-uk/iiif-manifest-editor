import { act, useState } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { EditorI18nProvider, useEditorI18n } from "@manifest-editor/i18n";
import { HeaderLanguageSwitcher } from "../src/components/site/HeaderLanguageSwitcher";
import { AboutText } from "../src/components/LegacyManifestEditor/apps/About/components/AboutText";
import ErrorPage from "../src/app/(main)/error";
import { WebI18nProvider, createWebI18n } from "../src/i18n/WebI18nProvider";
import { createWebUiPolicy, parseWebUiPreferences, UI_PREFERENCES_COOKIE, webUiCoverage } from "../src/i18n/policy";

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
  document.cookie = `${UI_PREFERENCES_COOKIE}=; Path=/; Max-Age=0`;
});
function container() {
  const node = document.createElement("div");
  document.body.append(node);
  return node;
}

it("uses translated coverage rather than English fallback for deployment gating", () => {
  const missingDutch = webUiCoverage("nl", "standard", ["web"], {});
  expect(missingDutch.complete).toBe(false);
  expect(missingDutch.missing).toContain("web:launcher.start");
  expect(webUiCoverage("nl", "plain", ["web", "shell", "editor-api"]).complete).toBe(true);
  expect(() => createWebUiPolicy({ requiredNamespaces: ["not-installed"] })).toThrow(/required namespaces/);
  const policy = createWebUiPolicy({ availableLocales: ["nl"], availableProfiles: ["plain"] });
  expect(createWebI18n({ locale: "en-GB", profile: "standard" }, policy).getSnapshot()).toMatchObject({
    locale: "nl",
    profile: "plain",
  });
});

it("hydrates the actual Dutch wording picker and help without a recovery or preference write", async () => {
  const tree = (
    <WebI18nProvider preferences={{ locale: "nl", profile: "plain" }}>
      <HeaderLanguageSwitcher />
      <AboutText />
    </WebI18nProvider>
  );
  const html = renderToString(tree);
  expect(html).toContain("Eenvoudig woordgebruik");
  expect(html).toContain("Wat is een manifest?");
  const node = container();
  node.innerHTML = html;
  const recoveries = vi.fn();
  await act(async () => {
    roots.push(hydrateRoot(node, tree, { onRecoverableError: recoveries }));
  });
  expect(recoveries).not.toHaveBeenCalled();
  expect(node.querySelector<HTMLSelectElement>("select[aria-label]")?.value).toBe("plain");
  expect(document.cookie).not.toContain(UI_PREFERENCES_COOKIE);
});

it("changes wording through the real control, preserves authored state, and persists only that choice", async () => {
  let runtime!: ReturnType<typeof useEditorI18n>;
  function Draft() {
    runtime = useEditorI18n();
    const [value] = useState("Teitl Cymraeg");
    return <input value={value} readOnly />;
  }
  const node = container();
  const root = createRoot(node);
  roots.push(root);
  await act(async () =>
    root.render(
      <WebI18nProvider>
        <HeaderLanguageSwitcher />
        <Draft />
      </WebI18nProvider>
    )
  );
  const input = node.querySelector("input");
  const select = node.querySelector<HTMLSelectElement>("select[aria-label]")!;
  await act(async () => {
    select.value = "plain";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(runtime.profile).toBe("plain");
  const cookie = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${UI_PREFERENCES_COOKIE}=`))
    ?.split("=")[1];
  expect(parseWebUiPreferences(cookie)).toEqual({ profile: "plain" });
  await act(async () => runtime.setLocale("nl"));
  expect(node.querySelector("input")).toBe(input);
  expect(input?.value).toBe("Teitl Cymraeg");
  expect(select.getAttribute("aria-label")).toBe("Woordgebruik");
});

it("announces rejected wording requests and retains the authoritative host choice", async () => {
  const runtime = createWebI18n({ locale: "nl" });
  const node = container();
  const root = createRoot(node);
  roots.push(root);
  await act(async () =>
    root.render(
      <EditorI18nProvider
        instance={runtime}
        profile="standard"
        onProfileChange={async () => {
          throw new Error("Rejected");
        }}
      >
        <HeaderLanguageSwitcher />
      </EditorI18nProvider>
    )
  );
  const select = node.querySelector<HTMLSelectElement>("select[aria-label]")!;
  await act(async () => {
    select.value = "plain";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(runtime.getSnapshot().profile).toBe("standard");
  expect(select.value).toBe("standard");
  expect(select.disabled).toBe(false);
  expect(node.textContent).toContain("De interface-instellingen konden niet worden gewijzigd.");
});

it("renders real translated route feedback and keeps the live retry callback", async () => {
  const reset = vi.fn();
  const node = container();
  const root = createRoot(node);
  roots.push(root);
  await act(async () =>
    root.render(
      <WebI18nProvider preferences={{ locale: "nl" }}>
        <ErrorPage error={new Error("technical")} reset={reset} />
      </WebI18nProvider>
    )
  );
  expect(node.querySelector('[role="alert"]')?.textContent).toBe("Deze pagina kon niet worden geladen.");
  const retry = [...node.querySelectorAll("button")].find((button) => button.textContent === "Opnieuw proberen")!;
  await act(async () => retry.click());
  expect(reset).toHaveBeenCalledOnce();
});

it("applies changed deployment allow-lists without remounting the draft", async () => {
  let controls!: ReturnType<typeof useEditorI18n>;
  function Draft() {
    controls = useEditorI18n();
    const [value] = useState("Titre français");
    return <input value={value} readOnly />;
  }
  const node = container();
  const root = createRoot(node);
  roots.push(root);
  const first = createWebUiPolicy();
  const render = (policy: typeof first) => (
    <WebI18nProvider policy={policy}>
      <HeaderLanguageSwitcher />
      <Draft />
    </WebI18nProvider>
  );
  await act(async () => root.render(render(first)));
  const input = node.querySelector("input");
  await act(async () =>
    root.render(render(createWebUiPolicy({ availableLocales: ["nl"], availableProfiles: ["plain"] })))
  );
  expect(controls.locale).toBe("nl");
  expect(controls.profile).toBe("plain");
  expect(controls.availableLocales.map((locale) => locale.id)).toEqual(["nl"]);
  expect(node.querySelector("input")).toBe(input);
  expect(input?.value).toBe("Titre français");
  await act(async () => {
    await expect(controls.setLocale("en-GB")).rejects.toThrow();
  });
  expect(document.cookie).not.toContain(UI_PREFERENCES_COOKIE);
});

it("forwards Dutch exhibition resources only to the matching effective runtime", async () => {
  const { createEditorI18n, defaultLocales, dutchLocale } = await import("@manifest-editor/i18n/core");
  const { webUiResources, webExhibitionResources } = await import("../src/i18n/resources");
  const options = { ...webUiResources, locales: [...defaultLocales, dutchLocale], locale: "nl" };
  const ordinary = createEditorI18n(options);
  const exhibition = createEditorI18n({ ...options, ...webExhibitionResources });
  expect(ordinary.translate("editors")("canvas.add")).toBe("Canvas toevoegen");
  expect(exhibition.translate("editors")("canvas.add")).toBe("Dia toevoegen");
  await exhibition.setProfile("plain");
  expect(exhibition.translate("editors")("canvas.count", { count: 2 })).toBe("2 dia's");
  expect(ordinary.translate("editors")("canvas.add")).toBe("Canvas toevoegen");
});
