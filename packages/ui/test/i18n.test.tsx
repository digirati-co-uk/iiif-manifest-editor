import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ThemeProvider } from "styled-components";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { AnnotationPagePreview } from "../ui/AnnotationPagePreview/AnnotationPagePreview";
import { MediaControls } from "../ui/MediaControls/MediaControls";
import { ViewControls } from "../ui/ViewControls/ViewControls";
import { DeleteButton } from "../ui/DeleteButton/DeleteButton";
import { CopyURL } from "../atoms/CopyURL";
import { ErrorBoundary } from "../atoms/ErrorBoundary";
import { AdditionalProperty } from "../atoms/AdditionalProperty";
import { EmptyProperty } from "../atoms/EmptyProperty";
import { Loading } from "../atoms/Loading";
import { RadioButtons } from "../atoms/RadioButtons";
import { SelectSearchField } from "../form-elements/SelectSearchField/SelectSearchField";
import { BoxSelectorField } from "../form-elements/BoxSelectorField/BoxSelectorField";

const media = vi.hoisted(() => ({
  page: {
    current: null as null | {
      id: string;
      label?: Record<string, string[]>;
      items: { id: string; type: "Annotation" }[];
    },
  },
  state: { duration: 120, isMuted: false, volume: 60, isPlaying: false, playRequested: false },
  actions: { play: vi.fn(), pause: vi.fn(), toggleMute: vi.fn(), setVolume: vi.fn(), setDurationPercent: vi.fn() },
  element: { current: null as HTMLVideoElement | null },
  world: { goHome: vi.fn(), zoomTo: vi.fn() },
}));
vi.mock("react-iiif-vault", () => ({
  useAnnotationPage: () => media.page.current,
  useMediaState: () => media.state,
  useMediaActions: () => media.actions,
  useMediaElements: () => ({ element: media.element, progress: { current: null }, currentTime: { current: null } }),
  useViewerPreset: () => ({ runtime: { world: media.world } }),
  formatTime: (seconds: number) => `${Math.floor(seconds / 60)}:00`,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let roots: Root[] = [];
const theme = { color: {}, padding: {} };
function runtime() {
  return createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
    config: { defaultLocale: "nl" },
  });
}
function mount(children: ReactNode, instance = runtime()) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  const render = async (next = children) => {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={instance}>
          <ThemeProvider theme={theme}>{next}</ThemeProvider>
        </EditorI18nProvider>
      )
    );
  };
  return { container, render, instance };
}
async function click(element: Element | null) {
  expect(element).not.toBeNull();
  await act(async () => element!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })));
}
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(media.state, { duration: 120, isMuted: false, volume: 60, isPlaying: false, playRequested: false });
  media.element.current = document.createElement("video");
});
afterEach(async () => {
  await act(async () => {
    for (const root of roots) root.unmount();
  });
  roots = [];
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

it("updates media labels and calls the existing play, pause, mute, volume and seek actions", async () => {
  const ui = mount(<MediaControls />);
  await ui.render();
  await click(ui.container.querySelector('[aria-label="Afspelen"]'));
  expect(media.actions.play).toHaveBeenCalledOnce();
  await click(ui.container.querySelector('[aria-label="Dempen"]'));
  expect(media.actions.toggleMute).toHaveBeenCalledOnce();
  const slider = ui.container.querySelector('input[type="range"]')! as HTMLInputElement;
  expect(document.querySelector(`label[for="${slider.id}"]`)?.textContent).toBe("Volume aanpassen");
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(slider, "25");
    slider.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(media.actions.setVolume).toHaveBeenCalledWith(25);
  const seek = ui.container.querySelector('[aria-label="Naar positie in media gaan"]')!;
  vi.spyOn(seek, "getBoundingClientRect").mockReturnValue({ left: 0, width: 100 } as DOMRect);
  await act(async () => seek.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 25 })));
  expect(media.actions.setDurationPercent).toHaveBeenCalledWith(0.25);
  Object.assign(media.state, { isPlaying: true, isMuted: true });
  await ui.render();
  await click(ui.container.querySelector('[aria-label="Pauzeren"]'));
  expect(media.actions.pause).toHaveBeenCalledOnce();
  expect(ui.container.querySelector('[aria-label="Dempen opheffen"]')).not.toBeNull();
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.querySelector('[aria-label="Pause"]')).not.toBeNull();
  expect(ui.container.querySelector('input[type="range"]')).toBe(slider);
});

it("gives separate players unique slider labels and uses the latest locale for media errors", async () => {
  const onError = vi.fn();
  const ui = mount(
    <>
      <MediaControls onError={onError} />
      <MediaControls />
    </>
  );
  await ui.render();
  const sliders = [...ui.container.querySelectorAll('input[type="range"]')];
  expect(sliders[0]!.id).not.toBe(sliders[1]!.id);
  await act(async () => {
    media.element.current!.dispatchEvent(new Event("error"));
  });
  expect(onError).toHaveBeenLastCalledWith("Deze media kan niet worden afgespeeld");
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  await act(async () => {
    media.element.current!.dispatchEvent(new Event("error"));
  });
  expect(onError).toHaveBeenLastCalledWith("Unable to play this media");
});

it("keeps viewer home and zoom behavior while locale and wording change", async () => {
  const ui = mount(<ViewControls />);
  await ui.render();
  expect(ui.container.textContent).toContain("Inzoomen");
  await click(ui.container.querySelector('[data-control="home"]'));
  await click(ui.container.querySelector('[data-control="zoom-out"]'));
  await click(ui.container.querySelector('[data-control="zoom-in"]'));
  expect(media.world.goHome).toHaveBeenCalledOnce();
  expect(media.world.zoomTo.mock.calls).toEqual([[1 / 0.75], [0.75]]);
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.textContent).toContain("Zoom in");
});

it("updates an open confirmation portal without losing its draft and deletes once", async () => {
  const onDelete = vi.fn();
  const instance = runtime();
  const ui = mount(
    <DeleteButton onDelete={onDelete}>
      <input defaultValue="Welsh authored text" />
    </DeleteButton>,
    instance
  );
  await ui.render();
  await click(ui.container.querySelector("button"));
  const modal = document.querySelector('[data-cy="modal"]')!;
  const input = modal.querySelector("input")!;
  input.value = "Unsaved authored text";
  expect(modal.textContent).toContain("Weet u zeker");
  expect(modal.closest('[lang="nl"][dir="ltr"]')).not.toBeNull();
  await act(async () => {
    await instance.setLocale("en-GB");
    await instance.setProfile("plain");
  });
  expect(document.querySelector('[data-cy="modal"] input')).toBe(input);
  expect(input.value).toBe("Unsaved authored text");
  expect(modal.textContent).toContain("Are you sure you want to delete?");
  await click([...modal.querySelectorAll("button")].find((button) => button.textContent === "Delete")!);
  expect(onDelete).toHaveBeenCalledOnce();
  expect(document.querySelector('[data-cy="modal"]')).toBeNull();
});

it("preserves caller labels/messages and changes profile wording on an open dialog", async () => {
  const instance = createEditorI18n({
    profiles: {
      plain: { "en-GB": { ui: { delete: { confirm: "Remove this item?" }, actions: { delete: "Remove item" } } } },
    },
  });
  const ui = mount(
    <>
      <DeleteButton onDelete={() => {}} />
      <DeleteButton label="Custom author label" message="Custom message" onDelete={() => {}} />
    </>,
    instance
  );
  await ui.render();
  await click(ui.container.querySelector("button"));
  await act(async () => {
    await instance.setProfile("plain");
  });
  expect(document.querySelector('[data-cy="modal"]')?.textContent).toContain("Remove this item?");
  expect(ui.container.textContent).toContain("Custom author label");
  await click(document.querySelector('[aria-label="Close"]'));
  await click([...ui.container.querySelectorAll("button")].find((b) => b.textContent === "Custom author label")!);
  expect(document.querySelector('[data-cy="modal"]')?.textContent).toContain("Custom message");
});

it("copies the unmodified URL and updates already visible success feedback after locale selection", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  const url = "https://example.org/manifest/cy?label=Gŵyl#test";
  const ui = mount(<CopyURL manifest={url} link={url} />);
  await ui.render();
  await click(ui.container.querySelector("button"));
  expect(writeText).toHaveBeenCalledWith(url);
  expect(ui.container.textContent).toContain("Gekopieerd!");
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.textContent).toContain("Copied!");
  expect(ui.container.querySelector("a")?.getAttribute("href")).toBe(url);
});

it("uses whole add-property labels and retains caller data", async () => {
  const add = vi.fn();
  const ui = mount(
    <>
      <AdditionalProperty label="Cyfeiriad" addAnother={add} />
      <EmptyProperty label="Teitl" createNew={add} />
      <Loading />
    </>
  );
  await ui.render();
  await click(ui.container.querySelector('[aria-label="Cyfeiriad toevoegen"]'));
  expect(add).toHaveBeenCalledOnce();
  expect(ui.container.querySelector('[aria-label="Teitl toevoegen"]')).not.toBeNull();
  expect(ui.container.querySelector("output[aria-label]")?.getAttribute("aria-label")).toBe("Laden…");
});

it("updates a caught error fallback without resetting the boundary", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  function Broken(): ReactNode {
    throw new Error("test failure");
  }
  const ui = mount(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>
  );
  await ui.render();
  expect(ui.container.textContent).toBe("Er is iets misgegaan");
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.textContent).toBe("Something went wrong");
});

it("keeps radio inputs mounted when translated labels change", async () => {
  const change = vi.fn();
  const ui = mount(
    <RadioButtons options={[{ label: "Original", value: "stable" }]} selectedIndex={0} onChange={change} />
  );
  await ui.render();
  const input = ui.container.querySelector("input");
  await ui.render(
    <RadioButtons options={[{ label: "Vertaling", value: "stable" }]} selectedIndex={0} onChange={change} />
  );
  expect(ui.container.querySelector("input")).toBe(input);
});

it("passes translated search placeholders and empty results into the real dependency", async () => {
  const ui = mount(<SelectSearchField search options={[]} />);
  await ui.render();
  const input = ui.container.querySelector("input")!;
  expect(input.getAttribute("placeholder")).toBe("Zoeken…");
  await act(async () => {
    input.focus();
    input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  });
  expect(ui.container.textContent).toContain("Geen resultaten gevonden");
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.querySelector("input")).toBe(input);
  expect(input.getAttribute("placeholder")).toBe("Search…");
  expect(ui.container.textContent).toContain("No results found");
});

it("submits unmodified numeric coordinates across a locale change", async () => {
  const onSubmit = vi.fn();
  const selector = {
    type: "BoxSelector" as const,
    spatial: { unit: "pixel" as const, x: 12, y: 34, width: 50, height: 60 },
  };
  const ui = mount(
    <BoxSelectorField selector={selector} form onSubmit={onSubmit}>
      <button type="submit">OK</button>
    </BoxSelectorField>
  );
  await ui.render();
  const width = ui.container.querySelector<HTMLInputElement>('[name="selector.width"]')!;
  width.value = "75";
  expect(ui.container.textContent).toContain("Breedte");
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.querySelector('[name="selector.width"]')).toBe(width);
  expect(width.value).toBe("75");
  await click(ui.container.querySelector("button"));
  expect(onSubmit).toHaveBeenCalledWith({ type: "BoxSelector", spatial: { x: 12, y: 34, width: 75, height: 60 } });
});

it("retains media duration/dimensions and uses updated callbacks without remounting", async () => {
  const first = vi.fn();
  const next = vi.fn();
  const dimensions = vi.fn();
  Object.defineProperties(media.element.current!, {
    duration: { configurable: true, value: 123.5 },
    videoWidth: { configurable: true, value: 1920 },
    videoHeight: { configurable: true, value: 1080 },
  });
  const ui = mount(<MediaControls onDuration={first} onDimensions={dimensions} />);
  await ui.render();
  await act(async () => {
    media.element.current!.dispatchEvent(new Event("loadedmetadata"));
  });
  expect(first).toHaveBeenCalledWith(123.5);
  expect(dimensions).toHaveBeenCalledWith(1920, 1080);
  await ui.render(<MediaControls onDuration={next} onDimensions={dimensions} />);
  await act(async () => {
    await ui.instance.setProfile("plain");
  });
  await act(async () => {
    media.element.current!.dispatchEvent(new Event("loadedmetadata"));
  });
  expect(first).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(123.5);
});

it("updates long text and RTL portal scope without resetting an active dialog", async () => {
  const instance = createEditorI18n({
    locales: [...defaultLocales, { id: "ar", nativeName: "العربية", direction: "rtl" }],
    catalogs: {
      ar: { ui: { actions: { delete: "حذف", close: "إغلاق" }, delete: { confirm: "هل تريد حذف هذا العنصر؟" } } },
    },
    profiles: {
      plain: {
        "en-GB": {
          ui: { delete: { confirm: "Delete this selected resource and all its associated details permanently?" } },
        },
      },
    },
  });
  const ui = mount(
    <DeleteButton onDelete={() => {}}>
      <input defaultValue="Authored Welsh: Cymru" />
    </DeleteButton>,
    instance
  );
  await ui.render();
  await click(ui.container.querySelector("button"));
  const draft = document.querySelector('[data-cy="modal"] input');
  await act(async () => {
    await instance.setProfile("plain");
  });
  expect(document.querySelector('[data-cy="modal"]')?.textContent).toContain("associated details permanently?");
  await act(async () => {
    await instance.setLocale("ar");
  });
  expect(document.querySelector('[data-cy="modal"] input')).toBe(draft);
  expect(draft?.closest('[lang="ar"][dir="rtl"]')).not.toBeNull();
  expect(document.querySelector('[aria-label="إغلاق"]')).not.toBeNull();
});

it("renders semantic annotation counts and preserves authored page labels and IDs", async () => {
  const id = "https://example.org/annotation-page/cy";
  const page = {
    id,
    label: { cy: ["Anodiadau Cymraeg"] },
    items: [{ id: "https://example.org/annotation/1", type: "Annotation" as const }],
  };
  media.page.current = page;
  const select = vi.fn();
  const ui = mount(<AnnotationPagePreview onClick={select} />);
  await ui.render();
  expect(ui.container.textContent).toContain("1 annotatie");
  expect(ui.container.textContent).toContain("Anodiadau Cymraeg");
  expect(ui.container.querySelector("a")?.getAttribute("href")).toBe(id);
  await click(ui.container.querySelector("a"));
  expect(select).toHaveBeenCalledOnce();
  page.items.push({ id: "https://example.org/annotation/2", type: "Annotation" });
  await ui.render();
  expect(ui.container.textContent).toContain("2 annotaties");
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.textContent).toContain("2 annotations");
  expect(page.label).toEqual({ cy: ["Anodiadau Cymraeg"] });
  page.items = [];
  await ui.render();
  expect(ui.container.textContent).toContain("0 annotations");
});

it("preserves caller search messages, option labels and selected values", async () => {
  const onChange = vi.fn();
  const ui = mount(
    <SelectSearchField
      search
      value="cy"
      options={[{ name: "Cymraeg", value: "cy" }]}
      placeholder="Author supplied"
      emptyMessage="Caller message"
      onChange={onChange}
    />
  );
  await ui.render();
  const input = ui.container.querySelector("input")!;
  expect(input.getAttribute("placeholder")).toBe("Author supplied");
  expect(input.value).toBe("Cymraeg");
  await act(async () => {
    await ui.instance.setLocale("en-GB");
  });
  expect(ui.container.querySelector("input")).toBe(input);
  expect(input.value).toBe("Cymraeg");
  expect(onChange).not.toHaveBeenCalled();
});
