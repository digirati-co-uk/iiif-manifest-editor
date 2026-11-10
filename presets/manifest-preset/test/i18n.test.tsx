import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LayoutActionsReactContext } from "../../../packages/shell/src/Layout/Layout.context";
import { VaultProvider, ManifestContext } from "react-iiif-vault";
import { ThemeProvider } from "styled-components";
import { Vault } from "@iiif/helpers/vault";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import type { CreatorContext } from "@manifest-editor/creator-api";
import { AvTemporalRangeCreatorForm, createAvTemporalRange } from "../src/av-ranges/av-temporal-range-creator";
import { getTemporalSegmentsFromStructures, validateTemporalSegments } from "../src/av-ranges/temporal-range-utils";
import { createTemporalRange, updateTemporalRange } from "../src/av-ranges/av-range-mutations";
import { getAvCanvases } from "../src/av-ranges/av-media-utils";

const instances: { root: Root; container: HTMLDivElement }[] = [];
const runtime = () =>
  createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
    requiredNamespaces: ["manifest"],
  });
async function mount(children: ReactNode, i18n = runtime()) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  instances.push({ root, container });
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={i18n}>
        <ThemeProvider theme={{ padding: {}, color: {}, sizes: {} }}>{children}</ThemeProvider>
      </EditorI18nProvider>
    )
  );
  return { container, i18n };
}
const m = "https://example.org/m";
const c = `${m}/canvas/1`;
function vaultFixture() {
  const vault = new Vault();
  vault.loadManifestSync(m, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: m,
    type: "Manifest",
    label: { cy: ["Eitem Gymraeg"] },
    items: [
      {
        id: c,
        type: "Canvas",
        label: { cy: ["Tudalen Gymraeg"] },
        duration: 90,
        items: [
          {
            id: `${c}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `${c}/painting`,
                type: "Annotation",
                motivation: "painting",
                target: c,
                body: { id: "https://example.org/movie.mp4", type: "Video", duration: 90, format: "video/mp4" },
              },
            ],
          },
        ],
      },
    ],
  });
  return vault;
}
function value(input: HTMLInputElement, text: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  for (const { root, container } of instances.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
});

it("keeps the real A/V form, selected resource and authored draft through English/Dutch and standard/plain switches", async () => {
  const vault = vaultFixture();
  const original = vault.toPresentation3({ id: m, type: "Manifest" });
  const canvas = getAvCanvases(vault, vault.get(m))[0]!;
  const runCreate = vi.fn();
  const props = {
    options: { initialData: { canvas, canvasId: c, title: "Pennod Gymraeg", start: 5, end: 15 } },
    runCreate,
    config: {},
  } as unknown as CreatorContext<any>;
  const { container, i18n } = await mount(<AvTemporalRangeCreatorForm {...props} />);
  const title = container.querySelector<HTMLInputElement>("#av-create-title")!;
  const start = container.querySelector<HTMLInputElement>("#av-create-start")!;
  expect(container.textContent).toContain("Create A/V range");
  await act(async () => value(title, "Pennod heb ei chadw"));
  await act(async () => value(start, "00:06.250"));
  for (const [locale, profile, heading] of [
    ["nl", "standard", "A/V-range aanmaken"],
    ["nl", "plain", "Audio-/videosectie toevoegen"],
    ["en-GB", "plain", "Add audio/video section"],
    ["en-GB", "standard", "Create A/V range"],
  ]) {
    await act(async () => i18n.select({ locale, profile }));
    expect(container.querySelector("#av-create-title")).toBe(title);
    expect(title.value).toBe("Pennod heb ei chadw");
    expect(start.value).toBe("00:06.250");
    expect(container.textContent).toContain(heading);
    expect(container.textContent).toContain("Tudalen Gymraeg");
    expect(vault.toPresentation3({ id: m, type: "Manifest" })).toEqual(original);
  }
  await act(async () =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  );
  expect(runCreate).toHaveBeenCalledWith({
    type: "Range",
    label: { en: ["Pennod heb ei chadw"] },
    canvasId: c,
    start: 6.25,
    end: 15,
    behavior: [],
  });
});

it("retranslates retained temporal validation references and keeps selectors, IDs and exported authored content unchanged", async () => {
  const vault = vaultFixture(),
    i18n = runtime();
  const ref = createTemporalRange(vault, vault.get(m), {
    canvasId: c,
    start: 5.125,
    end: 15.75,
    label: { cy: ["Pennod Gymraeg"] },
  });
  const segments = getTemporalSegmentsFromStructures(vault, vault.get(m));
  expect(segments[0]!.id).toBe(ref.id);
  const snapshot = vault.toPresentation3({ id: m, type: "Manifest" });
  const validation = validateTemporalSegments([{ id: ref.id, title: "Pennod Gymraeg", start: 20, end: 10 }], 90);
  const descriptor = validation.issues[0]!.messageReference!;
  expect(i18n.resolveMessage(descriptor)).toBe("End time must be after start time.");
  await i18n.setLocale("nl");
  expect(i18n.resolveMessage(descriptor)).toBe("De eindtijd moet na de begintijd liggen.");
  await i18n.setProfile("plain");
  expect(vault.toPresentation3({ id: m, type: "Manifest" })).toEqual(snapshot);
  updateTemporalRange(vault, segments[0]!, { start: 7.5, end: 17.125 });
  const changed = getTemporalSegmentsFromStructures(vault, vault.get(m))[0]!;
  expect(changed.id).toBe(ref.id);
  expect(changed.item.selector).toEqual({ type: "FragmentSelector", value: "t=7.5,17.125" });
  expect(changed.label).toEqual({ cy: ["Pennod Gymraeg"] });
  updateTemporalRange(vault, changed, { start: segments[0]!.start, end: segments[0]!.end });
  expect(vault.toPresentation3({ id: m, type: "Manifest" })).toEqual(snapshot);
  const embed = vi.fn((x) => x),
    generateId = vi.fn(() => `${m}/range/new`);
  const created = await createAvTemporalRange(
    { type: "Range", label: { cy: ["Cadw"] }, canvasId: c, start: 1.25, end: 2.5 },
    { embed, generateId, getParent: () => ({ id: m, type: "Manifest" }) } as any
  );
  expect(created).toMatchObject({
    id: `${m}/range/new`,
    label: { cy: ["Cadw"] },
    items: [{ source: { id: c, type: "Canvas" }, selector: { type: "FragmentSelector", value: "t=1.25,2.5" } }],
  });
});

it("keeps a real thumbnail configuration modal mounted, runs real Vault changes, and retranslates retained task history", async () => {
  const { createBulkThumbnailBuilderBackgroundAction } =
    await import("../src/bulk-thumbnail-builder/background-action");
  const { createBackgroundActionsStore, runBackgroundAction, getBackgroundActionInstanceKey } =
    await import("../../../packages/shell/src/BackgroundTasks/BackgroundTasksStore");
  const { createManifestEditorTagsApi, createManifestEditorCanvasProgressApi } = await import("@manifest-editor/shell");
  const vault = new Vault();
  vault.loadManifestSync(m, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: m,
    type: "Manifest",
    label: { cy: ["Eitem"] },
    items: [
      {
        id: c,
        type: "Canvas",
        label: { cy: ["Tudalen"] },
        width: 100,
        height: 200,
        items: [
          {
            id: `${c}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `${c}/image`,
                type: "Annotation",
                motivation: "painting",
                target: c,
                body: {
                  id: "https://example.org/image.jpg",
                  type: "Image",
                  format: "image/jpeg",
                  width: 100,
                  height: 200,
                },
              },
            ],
          },
        ],
      },
    ],
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(null, { status: 200, headers: { "content-type": "image/jpeg" } }))
  );
  const action = createBulkThumbnailBuilderBackgroundAction();
  const target = { id: m, type: "Manifest", label: "Eitem", scope: "root" as const };
  const instanceKey = getBackgroundActionInstanceKey(action.id, target);
  const store = createBackgroundActionsStore([action]);
  const ctx = {
    definition: action,
    target,
    instanceKey,
    rootResource: target,
    vault,
    tags: createManifestEditorTagsApi(vault),
    canvasProgress: createManifestEditorCanvasProgressApi(vault),
    plugins: { getSettings: () => ({}) },
    config: {},
    layoutState: {},
    layoutActions: {},
    i18n: undefined,
  } as any;
  const i18n = runtime();
  ctx.i18n = i18n;
  await mount(<VaultProvider vault={vault}>{action.render!(ctx)}</VaultProvider>, i18n);
  let running!: Promise<unknown>;
  await act(async () => {
    running = runBackgroundAction({ store, context: ctx });
    await Promise.resolve();
  });
  const select = document.querySelector<HTMLSelectElement>("select")!;
  expect(select).toBeTruthy();
  await act(async () => {
    select.value = "512";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  expect(document.querySelector("select")).toBe(select);
  expect(select.value).toBe("512");
  expect(document.body.textContent).toContain("Miniaturen in bulk maken");
  expect(document.body.textContent).toContain("1 pagina");
  const build = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (x) => x.textContent === "Miniaturen maken"
  )!;
  await act(async () => {
    build.click();
    await running;
  });
  const result = store.getState().instances[instanceKey]!.result as any;
  expect(result).toMatchObject({ added: 2, canvasAdded: 1, manifestAdded: true });
  const output = vault.toPresentation3({ id: m, type: "Manifest" }) as any;
  expect(output.label).toEqual({ cy: ["Eitem"] });
  expect(output.items[0].label).toEqual({ cy: ["Tudalen"] });
  expect(output.items[0].thumbnail[0].id).toBe("https://example.org/image.jpg");
  expect(output.items[0].items[0].items[0].target).toBe(c);
  const instance = store.getState().instances[instanceKey]!;
  const labelRef = instance.labelMessage!;
  expect(i18n.resolveMessage(labelRef)).toBe("Miniaturen maken");
  expect(instance.logs.some((log) => log.messageReference?.namespace === "manifest")).toBe(true);
  const plan = store.getState().plans[instanceKey]!;
  const before = JSON.stringify({ plan, result });
  await act(async () => i18n.select({ locale: "en-GB", profile: "standard" }));
  expect(i18n.resolveMessage(labelRef)).toBe("Building thumbnails");
  expect(
    JSON.stringify({
      plan: store.getState().plans[instanceKey],
      result: store.getState().instances[instanceKey]!.result,
    })
  ).toBe(before);
  expect(plan.tasks[0]!.target!.id).toBe(m);
  expect(plan.tasks[1]!.target!.id).toBe(c);
  expect(JSON.parse(JSON.stringify(plan)).tasks[0].labelMessage.namespace).toBe("manifest");
  vi.unstubAllGlobals();
});

it("uses the preset and embedded plugins' explicit manifest ownership and resolves all display definitions in Dutch/plain", async () => {
  const preset = await import("../src/index");
  const av = await import("../src/plugins/av-ranges");
  const remote = await import("../src/plugins/remote-inference");
  const quality = await import("../src/plugins/manifest-quality-checks");
  const i18n = runtime();
  await i18n.select({ locale: "nl", profile: "plain" });
  expect(preset.localisation.requiredNamespaces).toContain("manifest");
  expect(i18n.resolveMessage(preset.default.titleMessage)).toBe("Itemeditor");
  for (const panel of [
    ...preset.leftPanels,
    ...preset.centerPanels,
    ...av.leftPanels,
    ...av.centerPanels,
    ...quality.leftPanels,
  ]) {
    expect(panel.labelMessage, panel.id).toBeTruthy();
    expect(i18n.resolveMessage(panel.labelMessage)).not.toMatch(/^(manifest|shell|editor-api):/);
  }
  for (const plugin of [av, remote, quality]) {
    expect(plugin.default.localisation.requiredNamespaces).toEqual(["manifest"]);
    expect(plugin.default.labelMessage.namespace).toBe("manifest");
  }
  expect(i18n.getSnapshot().coverage.missing).toEqual([]);
});

it("retains a real inference settings draft and authored model names across locale/profile changes", async () => {
  const { settings } = await import("../src/plugins/remote-inference");
  const change = vi.fn();
  const { container, i18n } = await mount(settings.render!({ value: { models: [] }, onChange: change } as any));
  const key = container.querySelector<HTMLInputElement>('input[aria-label="Custom model key"]')!;
  const name = container.querySelector<HTMLInputElement>('input[aria-label="Custom model label"]')!;
  await act(async () => {
    value(key, "welsh-model");
    value(name, "Enw Cymraeg");
  });
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  expect(container.querySelector('input[aria-label="Sleutel van aangepast model"]')).toBe(key);
  expect(container.querySelector('input[aria-label="Naam van aangepast model"]')).toBe(name);
  expect(name.value).toBe("Enw Cymraeg");
  const add = [...container.querySelectorAll<HTMLButtonElement>("button")].find((x) => x.textContent === "Toevoegen")!;
  await act(async () => add.click());
  expect(change).toHaveBeenCalledWith({ models: [{ key: "welsh-model", label: "Enw Cymraeg" }] });
});

it("retains selected tag rows and authored labels, then confirms the exact selected Vault mutations in Dutch/plain", async () => {
  const { tagsPanel } = await import("../src/left-panels/tags");
  const { createManifestEditorTagsApi, getResourceTags } = await import("@manifest-editor/shell");
  const vault = vaultFixture(),
    tags = createManifestEditorTagsApi(vault);
  tags.setTags({ id: c, type: "Canvas" }, [
    { id: "cy-review", type: "review", label: "Adolygu Cymraeg", backgroundColor: "#000000", textColor: "#ffffff" },
  ]);
  const original = vault.toPresentation3({ id: m, type: "Manifest" });
  const { container, i18n } = await mount(
    <VaultProvider vault={vault}>
      <ManifestContext manifest={m}>{tagsPanel.render!({} as any, {} as any, {} as any)}</ManifestContext>
    </VaultProvider>
  );
  const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  expect(checkbox).toBeTruthy();
  await act(async () => checkbox.click());
  expect(checkbox.checked).toBe(true);
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  expect(container.querySelector('input[type="checkbox"]')).toBe(checkbox);
  expect(checkbox.checked).toBe(true);
  expect(container.textContent).toContain("Adolygu Cymraeg");
  expect(container.textContent).toContain("Pagina's met tags");
  expect(vault.toPresentation3({ id: m, type: "Manifest" })).toEqual(original);
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const button = [...container.querySelectorAll<HTMLButtonElement>("button")].find((x) =>
    x.textContent?.includes("Geselecteerde verwijderen (1)")
  )!;
  await act(async () => button.click());
  expect(confirm).toHaveBeenCalledWith("1 tagtoepassing van 1 pagina verwijderen?\n\n1 tag geselecteerd.");
  expect(getResourceTags(vault, { id: c, type: "Canvas" })).toHaveLength(1);
  confirm.mockReturnValue(true);
  await act(async () => button.click());
  expect(getResourceTags(vault, { id: c, type: "Canvas" })).toEqual([]);
  expect((vault.toPresentation3({ id: m, type: "Manifest" }) as any).label).toEqual({ cy: ["Eitem Gymraeg"] });
  confirm.mockRestore();
});

it("retranslates the real cached range-card collection without replacing range IDs, authored labels or selected editing mode", async () => {
  const { RangeCardView } = await import("../src/left-panels/components/RangeCardView");
  const { useRangeTreeOptions } = await import("../src/left-panels/components/RangeTree");
  const vault = vaultFixture();
  const child = createTemporalRange(vault, vault.get(m), {
    canvasId: c,
    start: 1,
    end: 10,
    label: { cy: ["Pennod Gymraeg"] },
  });
  // A non-temporal parent makes the real helper expose the authored child as a card.
  const { importEntities, addMappings } = await import("@iiif/helpers/vault/actions");
  const parent = `${m}/range/root`;
  vault.dispatch(
    importEntities({
      entities: { Range: { [parent]: { id: parent, type: "Range", label: { cy: ["Cynnwys"] }, items: [child] } } },
    } as any)
  );
  vault.dispatch(addMappings({ mapping: { [parent]: "Range" } }));
  vault.modifyEntityField({ id: m, type: "Manifest" }, "structures", [{ id: parent, type: "Range" }]);
  useRangeTreeOptions.setState({ isEditing: true });
  const original = vault.toPresentation3({ id: m, type: "Manifest" });
  const { container, i18n } = await mount(
    <VaultProvider vault={vault}>
      <ManifestContext manifest={m}>
        <LayoutActionsReactContext.Provider value={{ edit: vi.fn() } as any}>
          <RangeCardView />
        </LayoutActionsReactContext.Provider>
      </ManifestContext>
    </VaultProvider>
  );
  const row = container.querySelector('[role="row"]')!;
  expect(container.textContent).toContain("Pennod Gymraeg");
  expect(container.textContent).toContain("1 canvas");
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  expect(container.querySelector('[role="row"]')).toBe(row);
  expect(container.textContent).toContain("1 pagina");
  expect(container.textContent).toContain("Pennod Gymraeg");
  expect(container.querySelector('[aria-label="Acties voor Pennod Gymraeg"]')).toBeTruthy();
  expect(useRangeTreeOptions.getState().isEditing).toBe(true);
  expect(vault.toPresentation3({ id: m, type: "Manifest" })).toEqual(original);
  useRangeTreeOptions.setState({ isEditing: false });
});

it("renders retained quality issue descriptors and missing-title fallbacks under each wording without rewriting the Vault", async () => {
  const quality = await import("../src/plugins/manifest-quality-checks");
  const vault = new Vault();
  vault.loadManifestSync(m, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: m,
    type: "Manifest",
    items: [{ id: c, type: "Canvas", items: [] }],
  });
  const i18n = runtime(),
    original = vault.toPresentation3({ id: m, type: "Manifest" });
  const report = quality.createQualityReport(vault.get(m), vault);
  const issue = report.issues.find((x) => x.id === `${c}-label`)!;
  expect(i18n.resolveMessage(issue.titleMessage, issue.title)).toBe("Canvas label is missing");
  const { container } = await mount(
    <VaultProvider vault={vault}>
      <ManifestContext manifest={m}>{quality.leftPanels[0]!.render!({} as any, {} as any, {} as any)}</ManifestContext>
    </VaultProvider>,
    i18n
  );
  expect(container.textContent).toContain("Canvas 1");
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  expect(container.textContent).toContain("De pagina heeft een titel nodig.");
  expect(container.textContent).toContain("Pagina 1");
  expect(i18n.resolveMessage(issue.titleMessage, issue.title)).toBe("De pagina heeft een titel nodig.");
  expect(vault.toPresentation3({ id: m, type: "Manifest" })).toEqual(original);
});
