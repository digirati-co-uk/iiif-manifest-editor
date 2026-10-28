import { act, useState } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { createWebI18n, WebI18nProvider } from "../src/i18n/WebI18nProvider";
import {
  createWebUiPolicy,
  parseWebUiPreferences,
  serializeWebUiPreferences,
  UI_PREFERENCES_COOKIE,
  webUiSelection,
} from "../src/i18n/policy";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: { unmount(): void }[] = [];
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
  document.cookie = `${UI_PREFERENCES_COOKIE}=; Max-Age=0; Path=/`;
});
const stored = () =>
  document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${UI_PREFERENCES_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

it("validates versioned independent UI choices against the host allow-list", () => {
  const encode = (data: unknown) => encodeURIComponent(JSON.stringify(data));
  expect(parseWebUiPreferences(encode({ version: 1, locale: "nl", profile: "plain" }))).toEqual({
    locale: "nl",
    profile: "plain",
  });
  for (const data of [
    undefined,
    "%invalid",
    "null",
    "[]",
    encode({ version: 2, locale: "nl" }),
    encode({ version: 1, locale: "fr", profile: "other" }),
  ])
    expect(parseWebUiPreferences(data)).toEqual({});
  const restricted = createWebUiPolicy({ availableLocales: ["nl"], availableProfiles: ["plain"] });
  const preferences = parseWebUiPreferences(encode({ version: 1, locale: "en-GB", profile: "standard" }), restricted);
  expect(webUiSelection(preferences, restricted)).toEqual({ locale: "nl", profile: "plain" });
  expect(createWebI18n(preferences, restricted).getSnapshot()).toMatchObject({
    locale: "nl",
    profile: "plain",
    availableLocales: [{ id: "nl" }],
  });
  expect(() => createWebUiPolicy({ availableLocales: [] })).toThrow();
  expect(() => createWebUiPolicy({ availableLocales: ["fr"] })).toThrow();
  expect(() => createWebUiPolicy({ availableProfiles: ["custom"] })).toThrow();
  expect(() => createWebUiPolicy({ availableLocales: ["nl"], defaultLocale: "en-GB" })).toThrow();
  expect(serializeWebUiPreferences({ profile: "plain" }, true)).toContain("; SameSite=Lax; Secure");
});

it("hydrates the server-selected Dutch profile without fallback flash or recovery errors", async () => {
  const preferences = { locale: "nl", profile: "plain" };
  function Field() {
    const t = useTranslations("editor-api");
    return <output>{t("fields.label")}</output>;
  }
  const element = () => (
    <WebI18nProvider preferences={preferences}>
      <Field />
    </WebI18nProvider>
  );
  const html = renderToString(element());
  expect(html).toContain("Titel");
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  const recoveries = vi.fn();
  await act(async () => {
    roots.push(hydrateRoot(container, element(), { onRecoverableError: recoveries }));
  });
  expect(recoveries).not.toHaveBeenCalled();
  expect(container.innerHTML).toBe(html);
  expect(document.documentElement.lang).toBe("nl");
  expect(document.documentElement.dir).toBe("ltr");
  expect(stored()).toBeUndefined();
});

it("persists successful choices independently and preserves the draft and undo stack", async () => {
  let controls!: ReturnType<typeof useEditorI18n>;
  let edit!: () => void;
  let undo!: () => void;
  let mounts = 0;
  function Draft() {
    controls = useEditorI18n();
    const [history, setHistory] = useState(() => {
      mounts++;
      return ["Teitl Cymraeg"];
    });
    edit = () => setHistory((values) => [...values, "Testun heb ei gadw"]);
    undo = () => setHistory((values) => values.slice(0, -1));
    return <input value={history.at(-1)} readOnly />;
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  const tree = () => (
    <WebI18nProvider>
      <Draft />
    </WebI18nProvider>
  );
  await act(async () => root.render(tree()));
  expect(stored()).toBeUndefined();
  const input = container.querySelector("input")!;
  await act(async () => edit());
  await act(async () => controls.setProfile("plain"));
  expect(parseWebUiPreferences(stored())).toEqual({ profile: "plain" });
  await act(async () => controls.setLocale("nl"));
  expect(parseWebUiPreferences(stored())).toEqual({ locale: "nl", profile: "plain" });
  expect(document.documentElement.lang).toBe("nl");
  expect(container.querySelector("input")).toBe(input);
  expect(input.value).toBe("Testun heb ei gadw");
  await act(async () => root.render(tree()));
  expect(mounts).toBe(1);
  await act(async () => undo());
  expect(input.value).toBe("Teitl Cymraeg");
  const cookie = stored();
  await act(async () => {
    await expect(controls.setLocale("fr")).rejects.toThrow();
  });
  expect(stored()).toBe(cookie);
  expect(controls.locale).toBe("nl");
});
