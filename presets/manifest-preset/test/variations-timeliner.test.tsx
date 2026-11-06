import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, test, vi } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { ManifestContext, VaultProvider } from "react-iiif-vault";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "../../../packages/shell/src/ShellContext/default-theme";
import { SectionPanel } from "../src/variations-timeliner/SectionPanel";
import { SectionsSidebar } from "../src/variations-timeliner/SectionsSidebar";
import { useTimelinerStore } from "../src/variations-timeliner/store";
import { VariationsTimeliner } from "../src/variations-timeliner/VariationsTimeliner";
import metadata, { background, centerPanels, leftPanels, rightPanels } from "../src/plugins/variations-timeliner";

const actions = vi.hoisted(() => ({ edit: vi.fn(), open: vi.fn() }));
vi.mock("@manifest-editor/shell", async (original) => ({
  ...(await original<typeof import("@manifest-editor/shell")>()),
  useLayoutActions: () => actions,
}));

const id = "https://example.org/manifest";
const TIMELINE = "svg[aria-label='Section bubbles and timeline']";
function createVault() {
  const vault = new Vault();
  vault.loadManifestSync(id, {
    id,
    type: "Manifest",
    label: { en: ["Music"] },
    items: [
      {
        id: `${id}/canvas`,
        type: "Canvas",
        duration: 100,
        items: [
          {
            id: `${id}/page`,
            type: "AnnotationPage",
            items: [
              {
                id: `${id}/painting`,
                type: "Annotation",
                motivation: "painting",
                target: `${id}/canvas`,
                body: { id: "https://example.org/audio.mp3", type: "Sound", format: "audio/mpeg", duration: 100 },
              },
            ],
          },
        ],
      },
    ],
  });
  return vault;
}

async function mount(vault: Vault, ui: React.ReactNode) {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () =>
    root.render(
      <ThemeProvider theme={defaultTheme}>
        <VaultProvider vault={vault}>
          <ManifestContext manifest={id}>{ui}</ManifestContext>
        </VaultProvider>
      </ThemeProvider>
    )
  );
  return {
    container,
    button: (text: string) =>
      Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === text || b.getAttribute("aria-label") === text
      )!,
    unmount: async () => {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

beforeEach(() => {
  actions.edit.mockClear();
  actions.open.mockClear();
  localStorage.clear();
  // Zoom animates unless reduced motion is requested; tests want the end state immediately.
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as any;
  useTimelinerStore.setState({
    canvasId: null,
    selected: [],
    time: 0,
    seekTo: null,
    palette: "default",
    background: "#ffffff",
    square: false,
    monochrome: false,
    viewportHeight: 260,
    zooms: {},
    speed: 1,
    volume: 1,
    muted: false,
    loop: false,
  });
});

test("plugin contributes a sections sidebar, centre timeline, section editor panel and panel sync", () => {
  expect(metadata.defaultEnabled).toBe(false);
  expect(leftPanels.map((p) => p.id)).toEqual(["@manifest-editor/variations-timeliner-panel"]);
  expect(centerPanels.map((p) => p.id)).toEqual(["variations-timeliner"]);
  expect(rightPanels.map((p) => p.id)).toEqual(["@manifest-editor/variations-timeliner-section"]);
  expect(background).toHaveLength(1);
});

test("prompts for the first section, then selects it and lists it in the sidebar", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  const sidebar = await mount(vault, <SectionsSidebar />);
  try {
    // Nothing configured yet: both panels prompt instead of showing an empty timeline.
    expect(timeline.container.textContent).toContain("Create your first section");
    expect(timeline.container.querySelector(TIMELINE)).toBeNull();
    expect(sidebar.container.textContent).toContain("Create first section");
    expect(sidebar.container.querySelector("[aria-label='Sections']")).toBeNull();

    await act(async () => timeline.button("Create first section").click());
    const structures = (vault.toPresentation3({ id, type: "Manifest" }) as any).structures;
    expect(structures).toHaveLength(1);
    expect(structures[0].label.en[0]).toBe("Section 1");
    // The new bubble is selected, drawn on the timeline, and listed in the sidebar.
    expect(useTimelinerStore.getState().selected).toEqual([expect.stringContaining("/range/")]);
    expect(timeline.container.querySelector(TIMELINE)).toBeTruthy();
    expect(timeline.container.textContent).not.toContain("Create your first section");
    const row = sidebar.container.querySelector("[aria-label='Sections'] button")!;
    expect(row.textContent).toContain("Section 1");
    expect(row.getAttribute("aria-pressed")).toBe("true");

    await act(async () => timeline.button("Add marker").click());
    await act(async () => timeline.button("Add marker").click());
    expect(timeline.container.textContent).toContain("Markers");
    // Both markers share one annotation page rather than adding a page each.
    const annotations = (vault.toPresentation3({ id, type: "Manifest" }) as any).annotations;
    expect(annotations).toHaveLength(1);
    expect(annotations[0].items).toHaveLength(2);
  } finally {
    await timeline.unmount();
    await sidebar.unmount();
  }
});

test("the zoom controls do not stretch text, since the timeline is drawn at real pixel size", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    const svg = timeline.container.querySelector(TIMELINE)!;
    expect(svg.getAttribute("viewBox")).toBeNull();
    expect(svg.getAttribute("preserveAspectRatio")).toBeNull();
    expect(Number(svg.getAttribute("width"))).toBeGreaterThan(0);
    const separator = timeline.container.querySelector("[role=separator]")!;
    expect(separator.getAttribute("aria-valuenow")).toBe("260");
  } finally {
    await timeline.unmount();
  }
});

test("the bubble viewport can be resized from the keyboard", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    const separator = () => timeline.container.querySelector("[role=separator]")!;
    await act(async () => {
      separator().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(separator().getAttribute("aria-valuenow")).toBe("284");
    expect(timeline.container.querySelector(TIMELINE)!.getAttribute("height")).toBe("284");
  } finally {
    await timeline.unmount();
  }
});

test("theme palette is switchable and changes bubble colours", async () => {
  const vault = createVault();
  useTimelinerStore.setState({ palette: "default" });
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    const fill = () => timeline.container.querySelector(".vt-bubble path")!.getAttribute("fill");
    expect(fill()).toBe("#ACD4E2");
    await act(async () => useTimelinerStore.getState().setTheme({ palette: "deuteranopia" }));
    expect(fill()).toBe("#009192");
    expect(timeline.button("Theme")).toBeTruthy();
  } finally {
    await timeline.unmount();
    useTimelinerStore.getState().setTheme({ palette: "default" });
  }
});

test("section editor panel edits the Vault range and opens the full editor", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  await act(async () => timeline.button("Create first section").click());
  const [sectionId] = useTimelinerStore.getState().selected;
  const panel = await mount(vault, <SectionPanel id={sectionId} />);
  try {
    const input = (label: string) => panel.container.querySelector<HTMLInputElement>(`input[aria-label='${label}']`)!;
    expect(input("Start").value).toBe("00:00.000");
    expect(input("End").value).toBe("01:40.000");

    await act(async () => {
      const el = input("End");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, "00:30");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => input("End").dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    const range = vault.get({ id: sectionId!, type: "Range" }) as any;
    expect(JSON.stringify(range.items)).toContain("t=0,30");

    await act(async () => panel.container.querySelector<HTMLButtonElement>("[aria-label='Colour #A1F0C9']")!.click());
    // Only known IIIF properties are exported, so the colour must be saved as range metadata.
    const exported = () => (vault.toPresentation3({ id, type: "Manifest" }) as any).structures[0];
    expect(exported().metadata).toEqual([{ label: { none: ["tl:backgroundColour"] }, value: { none: ["#A1F0C9"] } }]);
    expect(timeline.container.querySelector(".vt-bubble path")!.getAttribute("fill")).toBe("#A1F0C9");
    await act(async () => panel.container.querySelector<HTMLButtonElement>("[aria-label='Automatic colour']")!.click());
    expect(exported().metadata ?? []).toEqual([]);
    expect(timeline.container.querySelector(".vt-bubble path")!.getAttribute("fill")).toBe("#ACD4E2");

    await act(async () => panel.button("Open in editor").click());
    expect(actions.edit).toHaveBeenCalledWith({ id: sectionId, type: "Range" }, {}, { forceOpen: true });
  } finally {
    await panel.unmount();
    await timeline.unmount();
  }
});

const pxOf = (el: Element | null) => Number(/translateX\(([\d.]+)px\)/.exec((el as HTMLElement).style.transform)![1]);

test("scrubber thumb, fill and the playhead line stay on the same x as the bubbles at any zoom", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    const { container } = timeline;
    const playhead = () => container.querySelector(".vt-playhead");
    const thumb = () => container.querySelector(".vt-thumb");
    const fill = () => container.querySelector<HTMLElement>(".vt-rail-fill")!;
    // clientWidth is 0 in jsdom, so the timeline falls back to 1000px; 14px inset each side.
    const expectedX = (time: number, zoom: number) => 14 + (time / 100) * (1000 * zoom - 28);

    await act(async () => useTimelinerStore.getState().seekTo!(50));
    expect(pxOf(playhead())).toBeCloseTo(expectedX(50, 1));
    expect(pxOf(thumb())).toBe(pxOf(playhead()));
    expect(parseFloat(fill().style.width)).toBeCloseTo(expectedX(50, 1) - 14);

    await act(async () => timeline.button("Zoom in").click());
    await act(async () => timeline.button("Zoom in").click());
    const zoom = 1.5 * 1.5;
    expect(container.querySelector(TIMELINE)!.getAttribute("width")).toBe(String(1000 * zoom));
    expect(pxOf(playhead())).toBeCloseTo(expectedX(50, zoom));
    expect(pxOf(thumb())).toBe(pxOf(playhead()));
    expect(parseFloat(fill().style.width)).toBeCloseTo(expectedX(50, zoom) - 14);

    // A selected section is highlighted on the rail exactly where its bubble is drawn.
    await act(async () => useTimelinerStore.getState().seekTo!(40));
    await act(async () => timeline.button("Split at playhead").click());
    const range = container.querySelector<HTMLElement>(".vt-rail-range")!;
    expect(parseFloat(range.style.left)).toBeCloseTo(expectedX(40, zoom));
    expect(parseFloat(range.style.left) + parseFloat(range.style.width)).toBeCloseTo(expectedX(100, zoom));
    const selectedPath = container.querySelector("[aria-pressed='true'] path")!;
    expect(Number(/^M([\d.]+),/.exec(selectedPath.getAttribute("d")!)![1])).toBeCloseTo(expectedX(40, zoom));
    expect(pxOf(playhead())).toBeCloseTo(expectedX(40, zoom));
  } finally {
    await timeline.unmount();
  }
});

test("scrubbing maps the pointer through the scrolled surface, so the line lands under the pointer", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    await act(async () => timeline.button("Zoom in").click());
    await act(async () => timeline.button("Zoom in").click());
    await act(async () => timeline.button("Zoom in").click());
    const { container } = timeline;
    const surfaceWidth = 1000 * 1.5 ** 3;
    // Scrolled 700px to the right: the surface's left edge is at -700 in the viewport.
    const surface = container.querySelector<HTMLElement>(".vt-surface")!;
    surface.getBoundingClientRect = () => ({ left: -700, top: 0, width: surfaceWidth, height: 300 }) as DOMRect;
    const rail = container.querySelector(".vt-rail")!;
    await act(async () => {
      rail.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, clientX: 420 }));
    });
    const seek = useTimelinerStore.getState().time;
    // 420 - (-700) = 1120px into the surface.
    expect(seek).toBeCloseTo(((1120 - 14) / (surfaceWidth - 28)) * 100);
    expect(pxOf(container.querySelector(".vt-playhead"))).toBeCloseTo(1120);
    expect(pxOf(container.querySelector(".vt-thumb"))).toBeCloseTo(1120);
    // The pointer guide (hover line) uses the same coordinates, and is drawn over bubbles and rail.
    expect(pxOf(container.querySelector(".vt-hover-line"))).toBeCloseTo(1120);
    expect(container.querySelector(".vt-surface")!.contains(container.querySelector(TIMELINE))).toBe(true);
    expect(container.querySelector(".vt-surface")!.contains(container.querySelector(".vt-rail"))).toBe(true);
  } finally {
    await timeline.unmount();
  }
});

test("sizes, zoom and playback preferences are saved to local storage and restored", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  const key = "manifest-editor:variations-timeliner";
  try {
    await act(async () => timeline.button("Create first section").click());
    await act(async () => {
      timeline.container
        .querySelector("[role=separator]")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    await act(async () => timeline.button("Zoom in").click());
    await act(async () => timeline.button("Loop section").click());
    await act(async () => timeline.button("Mute").click());
    await act(async () => useTimelinerStore.getState().setTheme({ palette: "warm", background: "#fef9c3" }));

    const raw = localStorage.getItem(key)!;
    const saved = JSON.parse(raw).state;
    expect(saved).toMatchObject({
      viewportHeight: 284,
      zooms: { [`${id}/canvas`]: 1.5 },
      loop: true,
      muted: true,
      palette: "warm",
      background: "#fef9c3",
    });
    // Transient state is not persisted.
    expect(saved.selected).toBeUndefined();
    expect(saved.time).toBeUndefined();

    useTimelinerStore.setState({ viewportHeight: 260, zooms: {}, loop: false, muted: false, palette: "default" });
    // Simulate a page reload: the in-memory store is fresh, only local storage remains.
    localStorage.setItem(key, raw);
    await act(async () => useTimelinerStore.persist.rehydrate());
    expect(useTimelinerStore.getState()).toMatchObject({
      viewportHeight: 284,
      loop: true,
      muted: true,
      palette: "warm",
    });
    expect(timeline.container.querySelector("[role=separator]")!.getAttribute("aria-valuenow")).toBe("284");
    expect(timeline.container.querySelector(TIMELINE)!.getAttribute("width")).toBe("1500");
  } finally {
    await timeline.unmount();
  }
});

test("elements positioned with an inline translateX never also use the scale/translate properties", async () => {
  // `scale:` and `translate:` apply outside `transform`, so on these elements they would multiply the pixel
  // offset (huge when zoomed in) and push the line or thumb away from the pointer, but only while hovering.
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    const css = Array.from(document.querySelectorAll("style"))
      .map(
        (style) =>
          style.textContent +
          Array.from((style as HTMLStyleElement).sheet?.cssRules || [])
            .map((r) => r.cssText)
            .join("\n")
      )
      .join("\n");
    expect(css).toContain("vt-thumb");
    const rules = css.match(/[^{}]+\{[^}]*\}/g) || [];
    for (const rule of rules) {
      const [selector, body] = rule.split("{");
      if (/\.vt-(thumb|playhead|hover-line)\b(?!::)/.test(selector!) && !/::after|::before/.test(selector!)) {
        expect(body, selector).not.toMatch(/(^|[;\s])(scale|translate|rotate)\s*:/);
      }
    }
  } finally {
    await timeline.unmount();
  }
});

test("the sidebar and timeline are only offered for manifests with an audio or video canvas", () => {
  const withAudio = createVault();
  const ctx = (vault: Vault, rootId = id) => ({ rootResource: { id: rootId, type: "Manifest" }, vault }) as any;
  expect(leftPanels[0]!.supports!(ctx(withAudio))).toBe(true);
  expect(centerPanels[0]!.supports!(ctx(withAudio))).toBe(true);

  const noMedia = new Vault();
  noMedia.loadManifestSync("https://example.org/plain", {
    id: "https://example.org/plain",
    type: "Manifest",
    label: { en: ["Images only"] },
    items: [{ id: "https://example.org/plain/canvas", type: "Canvas", width: 10, height: 10, items: [] }],
  });
  expect(leftPanels[0]!.supports!(ctx(noMedia, "https://example.org/plain"))).toBe(false);
  expect(centerPanels[0]!.supports!(ctx(noMedia, "https://example.org/plain"))).toBe(false);
  expect(leftPanels[0]!.supports!({ vault: withAudio } as any)).toBe(false);
});

test("markers are listed with a time chip, an editable title and a delete button, and the empty state explains itself", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    const { container } = timeline;
    expect(container.querySelector("[aria-label='Markers']")!.textContent).toContain("No markers yet");

    await act(async () => useTimelinerStore.getState().seekTo!(12.5));
    await act(async () => timeline.button("Add marker at playhead").click());
    await act(async () => useTimelinerStore.getState().seekTo!(30));
    await act(async () => timeline.button("Add marker").click());

    const rows = container.querySelectorAll("[aria-label='Markers'] li");
    expect(rows).toHaveLength(2);
    expect(container.querySelector("[aria-label='Markers'] .count")!.textContent).toBe("2");
    // The first marker is the one the playhead has most recently passed… until it reaches the second.
    expect(rows[0]!.getAttribute("data-current")).toBe("false");
    expect(rows[1]!.getAttribute("data-current")).toBe("true");
    // Time chip, with the milliseconds toned down.
    const chip = rows[0]!.querySelector(".time")!;
    expect(chip.textContent).toBe("00:12.500");
    expect((chip.querySelector("[data-ms]") as HTMLElement).style.opacity).toBe("0.55");
    expect(rows[0]!.querySelector("input")!.getAttribute("aria-label")).toBe("Marker title at 00:12.500");
    await act(async () => chip.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(useTimelinerStore.getState().time).toBe(12.5);

    await act(async () => rows[0]!.querySelector<HTMLButtonElement>(".delete")!.click());
    expect(container.querySelectorAll("[aria-label='Markers'] li")).toHaveLength(1);
  } finally {
    await timeline.unmount();
  }
});

test("layout guards against the stray sideways scroll and the misaligned markers heading", async () => {
  const vault = createVault();
  const timeline = await mount(vault, <VariationsTimeliner />);
  try {
    await act(async () => timeline.button("Create first section").click());
    // Tooltips that are not showing must not exist: an invisible one still widens the scrollable area.
    expect(timeline.container.querySelector(".vt-tip")).toBeNull();
    // styled-components minifies, so compare without whitespace.
    const css = Array.from(document.querySelectorAll("style"))
      .map((style) => style.textContent)
      .join("\n")
      .replace(/\s+/g, "");
    expect(css).toContain("overflow-x:hidden");
    // The manifest title style must not leak onto the markers panel heading.
    expect(css).toContain(".vt-details>section>h2{");
    expect(css).not.toMatch(/\.vt-details(?!>)h2/);
    expect(css).toContain("grid-template-columns:minmax(0,1fr)minmax(0,1fr)");
  } finally {
    await timeline.unmount();
  }
});
