import { act, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { createEditorI18n } from "@manifest-editor/i18n/core";
import { EditorI18nProvider, useTranslations } from "@manifest-editor/i18n";
import { createWebUiPolicy } from "../src/i18n/policy";
import { webUiResources } from "../src/i18n/resources";
import { webLocaleLoaders, webExhibitionLoaders } from "../src/i18n/additional-resources";
import { preloadWebResources } from "../src/i18n/preload";
import { WebI18nProvider } from "../src/i18n/WebI18nProvider";
import { useWebUiResources, useWebExhibitionResources } from "../src/i18n/WebResources";

const imports = vi.hoisted(() => ({ fr: 0, nl: 0 }));
vi.mock("../src/i18n/locales/fr", async (original) => {
  imports.fr++;
  return original();
});
vi.mock("../src/i18n/locales/nl", async (original) => {
  imports.nl++;
  return original();
});
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: { unmount(): void }[] = [];
afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.innerHTML = "";
});

it("negotiates all locales without importing values, then imports only the selected language", async () => {
  expect(imports).toEqual({ fr: 0, nl: 0 });
  const policy = createWebUiPolicy();
  expect(policy.config.availableLocales).toHaveLength(18);
  const runtime = createEditorI18n({ ...policy, ...webUiResources });
  await runtime.select({});
  expect(imports).toEqual({ fr: 0, nl: 0 });
  await runtime.select({ locale: "fr", profile: "plain" });
  expect(runtime.translate("editor-api")("fields.label")).toBe("Titre");
  expect(imports).toEqual({ fr: 1, nl: 0 });
  await runtime.setProfile("standard");
  expect(runtime.translate("editor-api")("fields.label")).toBe("Libellé");
  expect(imports).toEqual({ fr: 1, nl: 0 });
});

it("preloads one serializable locale and hydrates child resource scopes without fallback", async () => {
  const initialResources = JSON.parse(JSON.stringify(await preloadWebResources("nl")));
  const baseDownload = vi.spyOn(
    webLocaleLoaders.find((loader) => loader.locale === "nl")!,
    "load"
  );
  const presetDownload = vi.spyOn(
    webExhibitionLoaders.find((loader) => loader.locale === "nl")!,
    "load"
  );
  expect(Object.keys(initialResources.ui.catalogs)).toEqual(["nl"]);
  function Label() {
    return <output>{useTranslations("editors")("canvas.add")}</output>;
  }
  function Scope({ exhibition }: { exhibition: boolean }) {
    const ui = useWebUiResources();
    const preset = useWebExhibitionResources();
    const [runtime] = useState(() => createEditorI18n({ ...ui, ...(exhibition ? preset : {}), locale: "nl" }));
    return (
      <EditorI18nProvider instance={runtime}>
        <Label />
      </EditorI18nProvider>
    );
  }
  const tree = (
    <WebI18nProvider preferences={{ locale: "nl" }} initialResources={initialResources}>
      <Scope exhibition={false} />
      <Scope exhibition />
    </WebI18nProvider>
  );
  const html = renderToString(tree);
  expect(html).toContain("Canvas toevoegen");
  expect(html).toContain("Dia toevoegen");
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  const recoveries = vi.fn();
  await act(async () => {
    roots.push(hydrateRoot(container, tree, { onRecoverableError: recoveries }));
  });
  expect(recoveries).not.toHaveBeenCalled();
  expect(container.innerHTML).toBe(html);
  expect(baseDownload).not.toHaveBeenCalled();
  expect(presetDownload).not.toHaveBeenCalled();
  baseDownload.mockRestore();
  presetDownload.mockRestore();
});
