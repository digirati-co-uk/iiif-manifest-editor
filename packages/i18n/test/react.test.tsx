// @vitest-environment jsdom
import { act, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it } from "vitest";
import {
  createEditorI18n,
  defaultLocales,
  EditorI18nProvider,
  EditorI18nScope,
  EditorTrans,
  useEditorI18n,
  useOptionalEditorI18nInstance,
  useTranslations,
} from "../src";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const options = {
  locales: [...defaultLocales, { id: "fr", nativeName: "Français", direction: "ltr" as const }],
  catalogs: {
    "en-GB": { demo: { title: "English", sentence: "Read <link>{{name}}</link> to continue." } },
    fr: { demo: { title: "Français", sentence: "Lisez <link>{{name}}</link> pour continuer." } },
  },
  profiles: { plain: { "en-GB": { demo: { title: "Plain English" } } } },
};
const roots: { unmount(): void }[] = [];
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
});
function mount(element: React.ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  return {
    container,
    root,
    render: async (next = element) => {
      await act(async () => root.render(next));
    },
  };
}
import { Plugin } from "./fixtures/plugin-consumer";

it("isolates two providers and preserves unsaved form and undo state across snapshots", async () => {
  const a = createEditorI18n(options);
  const b = createEditorI18n({ ...options, locale: "fr" });
  let edit!: () => void;
  let undo!: () => void;
  let mounts = 0;
  function Draft() {
    const [history, setHistory] = useState(() => {
      mounts++;
      return ["original"];
    });
    edit = () => setHistory((h) => [...h, "unsaved"]);
    undo = () => setHistory((h) => h.slice(0, -1));
    return (
      <>
        <input value={history.at(-1)} readOnly />
        <Plugin />
      </>
    );
  }
  const ui = mount(
    <>
      <EditorI18nProvider instance={a}>
        <Draft />
      </EditorI18nProvider>
      <EditorI18nProvider instance={b}>
        <Plugin />
      </EditorI18nProvider>
    </>
  );
  await ui.render();
  await act(async () => edit());
  await act(async () => a.setProfile("plain"));
  expect([...ui.container.querySelectorAll("output")].map((node) => node.textContent)).toEqual([
    "Plain English",
    "Français",
  ]);
  await act(async () => a.setLocale("fr"));
  expect(ui.container.querySelector("input")?.value).toBe("unsaved");
  expect(mounts).toBe(1);
  await act(async () => undo());
  expect(ui.container.querySelector("input")?.value).toBe("original");
});
it("updates uncontrolled locale and profile through the public hook", async () => {
  let changeProfile!: () => Promise<void>;
  let changeLocale!: () => Promise<void>;
  function Controls() {
    const { setLocale, setProfile } = useEditorI18n();
    changeProfile = () => setProfile("plain");
    changeLocale = () => setLocale("fr");
    return <Plugin />;
  }
  const ui = mount(
    <EditorI18nProvider {...options}>
      <Controls />
    </EditorI18nProvider>
  );
  await ui.render();
  await act(async () => changeProfile());
  expect(ui.container.textContent).toBe("Plain English");
  await act(async () => changeLocale());
  expect(ui.container.textContent).toBe("Français");
});
it("supports controlled selection requests without changing until the host supplies props", async () => {
  const requests: string[] = [];
  let request!: () => Promise<void>;
  function Controls() {
    const runtime = useEditorI18n();
    request = () => runtime.setLocale("fr");
    return <Plugin />;
  }
  const render = (locale: string) => (
    <EditorI18nProvider {...options} locale={locale} onLocaleChange={(value) => requests.push(value)}>
      <Controls />
    </EditorI18nProvider>
  );
  const ui = mount(render("en-GB"));
  await ui.render();
  await act(async () => request());
  expect(requests).toEqual(["fr"]);
  expect(ui.container.textContent).toBe("English");
  await ui.render(render("fr"));
  expect(ui.container.textContent).toBe("Français");
});
it("renders validated full rich sentences and scopes portals", async () => {
  const portal = document.createElement("div");
  document.body.append(portal);
  const ui = mount(
    <EditorI18nProvider {...options} locale="fr">
      <EditorTrans
        reference={{ namespace: "demo", key: "sentence", values: { name: "Guide" } }}
        components={{ link: <a href="https://example.org/guide">Guide</a> }}
      />
      {createPortal(
        <EditorI18nScope>
          <Plugin />
        </EditorI18nScope>,
        portal
      )}
    </EditorI18nProvider>
  );
  await ui.render();
  expect(ui.container.textContent).toBe("Lisez Guide pour continuer.");
  expect(ui.container.querySelector("a")?.getAttribute("href")).toBe("https://example.org/guide");
  expect(portal.querySelector("[lang]")?.getAttribute("lang")).toBe("fr");
  expect(portal.textContent).toBe("Français");
});
it("starts SSR and hydration with identical supplied resources", async () => {
  const make = () => (
    <EditorI18nProvider {...options} locale="fr">
      <Plugin />
    </EditorI18nProvider>
  );
  const html = renderToString(make());
  expect(html).toContain("Français");
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  const errors: unknown[] = [];
  await act(async () => {
    roots.push(hydrateRoot(container, make(), { onRecoverableError: (error) => errors.push(error) }));
  });
  expect(errors).toEqual([]);
  expect(container.innerHTML).toBe(html);
});
it("supports standalone UI defaults without a provider", async () => {
  function Standalone() {
    const t = useTranslations("common");
    return <span>{t("actions.save")}</span>;
  }
  const ui = mount(<Standalone />);
  await ui.render();
  expect(ui.container.textContent).toBe("Save");
});

it("renders interpolation as text without allowing markup or engine-option overrides", async () => {
  const attack = '<link href="https://evil.example">Injected</link> {{count}} & text';
  const ui = mount(
    <EditorI18nProvider {...options}>
      <EditorTrans
        reference={{ namespace: "demo", key: "sentence", values: { name: attack, count: 2, lng: "fr", ns: "other" } }}
        components={{ link: <a href="https://example.org/guide">Guide</a> }}
      />
    </EditorI18nProvider>
  );
  await ui.render();
  expect(ui.container.querySelectorAll("a")).toHaveLength(1);
  expect(ui.container.querySelector("a")?.getAttribute("href")).toBe("https://example.org/guide");
  expect(ui.container.textContent).toBe(`Read ${attack} to continue.`);
});

it("does not spread business variables named like engine options in rich messages", async () => {
  const rich = {
    "en-GB": { safe: { sentence: "Area {{ns}}, language {{lng}}: <link>{{name}}</link>." } },
    fr: { safe: { sentence: "Zone {{ns}}, langue {{lng}} : <link>{{name}}</link>." } },
  };
  const ui = mount(
    <EditorI18nProvider {...options} catalogs={rich}>
      <EditorTrans
        reference={{ namespace: "safe", key: "sentence", values: { ns: "other", lng: "fr", name: "Guide" } }}
        components={{ link: <a href="https://example.org/safe">Guide</a> }}
      />
    </EditorI18nProvider>
  );
  await ui.render();
  expect(ui.container.textContent).toBe("Area other, language fr: Guide.");
  expect(ui.container.querySelector("a")?.getAttribute("href")).toBe("https://example.org/safe");
});

it("keeps numeric plural selection separate from rich interpolation markers", async () => {
  const ui = mount(
    <EditorI18nProvider
      catalogs={{
        "en-GB": {
          demo: {
            count_one: "<strong>{{count}}</strong> item for {{name}}",
            count_other: "<strong>{{count}}</strong> items for {{name}}",
          },
        },
      }}
    >
      <EditorTrans
        reference={{ namespace: "demo", key: "count", values: { count: 2, name: "<b>literal</b>" } }}
        components={{ strong: <strong /> }}
      />
    </EditorI18nProvider>
  );
  await ui.render();
  expect(ui.container.textContent).toBe("2 items for <b>literal</b>");
  expect(ui.container.querySelector("strong")?.textContent).toBe("2");
  expect(ui.container.querySelector("b")).toBeNull();
});

it("rejects unsafe markup in rich fallback strings and numeric component names", () => {
  const element = (
    fallback: string,
    components: Record<string, React.ReactElement> = { link: <a href="https://example.org/safe">Guide</a> }
  ) => (
    <EditorI18nProvider {...options}>
      <EditorTrans reference={{ namespace: "demo", key: "absent", defaultValue: fallback }} components={components} />
    </EditorI18nProvider>
  );
  expect(() => renderToString(element('<link href="https://evil.example">Bad</link>'))).toThrow(
    "Invalid source message"
  );
  expect(() => renderToString(element("<0>Bad</0>"))).toThrow("Invalid source message");
  expect(() => renderToString(element("Safe text", { "0": <a href="https://example.org/safe">Guide</a> }))).toThrow(
    "named tags"
  );
});

it("combined selection honours controlled settings and applies only uncontrolled fields", async () => {
  const requests: string[] = [];
  let controls!: ReturnType<typeof useEditorI18n>;
  function Controls() {
    controls = useEditorI18n();
    return <Plugin />;
  }
  const ui = mount(
    <EditorI18nProvider
      {...options}
      locale="en-GB"
      profile="standard"
      onLocaleChange={(locale) => requests.push(locale)}
      onProfileChange={(profile) => requests.push(profile)}
    >
      <Controls />
    </EditorI18nProvider>
  );
  await ui.render();
  await act(async () => controls.select({ locale: "fr", profile: "plain" }));
  expect(requests).toEqual(["fr", "plain"]);
  expect(ui.container.textContent).toBe("English");
  await ui.render(
    <EditorI18nProvider {...options} locale="en-GB">
      <Controls />
    </EditorI18nProvider>
  );
  await act(async () => controls.select({ locale: "fr", profile: "plain" }));
  expect(controls.locale).toBe("en-GB");
  expect(controls.profile).toBe("plain");
  expect(ui.container.textContent).toBe("Plain English");
});

it("an optional instance hook preserves actual provider identity and has no standalone fallback", async () => {
  const runtime = createEditorI18n(options);
  const seen: unknown[] = [];
  function Probe() {
    seen.push(useOptionalEditorI18nInstance());
    return null;
  }
  const ui = mount(
    <>
      <Probe />
      <EditorI18nProvider instance={runtime}>
        <Probe />
      </EditorI18nProvider>
    </>
  );
  await ui.render();
  expect(seen).toContain(undefined);
  expect(seen).toContain(runtime);
});
