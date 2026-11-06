import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import {
  MediaPlayer,
  MediaAnnouncer,
  TimeSlider,
  TextTrack,
  useChapterOptions,
  type MediaPlayerInstance,
} from "@vidstack/react";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { useMediaTimeTranslations } from "../src/useMediaTimeTranslations";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
beforeEach(() => {
  Object.assign(window, {
    VTTCue: class extends EventTarget {
      id = "";
      pauseOnExit = false;
      constructor(
        public startTime: number,
        public endTime: number,
        public text: string
      ) {
        super();
      }
    },
  });
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = vi
    .fn()
    .mockImplementation(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});
it("localises actual player time ARIA, seek announcements and chapter durations while retaining media state and content language", async () => {
  const i18n = createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
  });
  const ref = createRef<MediaPlayerInstance>();
  function Chapters() {
    const options = useChapterOptions();
    return (
      <div>
        {options.map((option) => (
          <span key={option.value}>
            {option.label}: {option.durationText}
          </span>
        ))}
      </div>
    );
  }
  function Player() {
    const uiTime = useMediaTimeTranslations();
    return (
      <MediaPlayer ref={ref} lang="cy" duration={3662} load="custom" uiTime={uiTime}>
        <TimeSlider.Root aria-label="Seek" style={{ opacity: 1 }} />
        <MediaAnnouncer />
        <Chapters />
      </MediaPlayer>
    );
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={i18n}>
          <Player />
        </EditorI18nProvider>
      )
    );
    const player = ref.current!;
    await act(async () => {
      player.$state.realCurrentTime.set(65);
      player.$state.canPlay.set(true);
    });
    const slider = container.querySelector('[role="slider"]')!;
    expect(slider.getAttribute("aria-valuetext")).toBe("1 minute, 5 seconds out of 1 hour, 1 minute, 2 seconds");
    const time = player.state.currentTime;
    const element = player.el;
    await act(async () => i18n.setLocale("nl"));
    expect(ref.current).toBe(player);
    expect(player.el).toBe(element);
    expect(player.el?.getAttribute("lang")).toBe("cy");
    expect(player.state.currentTime).toBe(time);
    expect(slider.getAttribute("aria-valuetext")).toBe("1 minuut en 5 seconden van 1 uur, 1 minuut en 2 seconden");
    // Drive the real media state consumed by the announcer, without a network/player mock.
    await act(async () => {
      player.$state.seeking.set(true);
    });
    await act(async () => {
      player.$state.realCurrentTime.set(67);
      player.$state.seeking.set(false);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
    expect(container.querySelector("[data-media-announcer]")?.getAttribute("aria-label")).toContain(
      "2 seconden vooruitspoelen"
    );
    await act(async () => {
      player.$state.seeking.set(true);
    });
    await act(async () => {
      player.$state.realCurrentTime.set(66);
      player.$state.seeking.set(false);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
    expect(container.querySelector("[data-media-announcer]")?.getAttribute("aria-label")).toContain(
      "1 seconde terugspoelen"
    );
    const track = new TextTrack({
      kind: "chapters",
      language: "cy",
      label: "Penodau",
      content: { cues: [new window.VTTCue(0, 65, "Pennod Cymraeg")] },
      type: "json",
    });
    await act(async () => {
      player.textTracks.add(track);
      track.mode = "showing";
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(container.textContent).toContain("Pennod Cymraeg: 1 minuut en 5 seconden");
    await act(async () => i18n.setLocale("en-GB"));
    expect(container.textContent).toContain("Pennod Cymraeg: 1 minute, 5 seconds");
    expect(player.textTracks.toArray()[0]).toBe(track);
    expect(track.language).toBe("cy");
    await act(async () => {
      player.$state.realCurrentTime.set(0);
      player.$state.providedDuration.set(2);
    });
    expect(slider.getAttribute("aria-valuetext")).toBe("0 seconds out of 2 seconds");
    await act(async () => i18n.setLocale("nl"));
    expect(slider.getAttribute("aria-valuetext")).toBe("0 seconden van 2 seconden");
    await act(async () => {
      player.$state.realCurrentTime.set(1);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(slider.getAttribute("aria-valuetext")).toBe("1 seconde van 2 seconden");
    await act(async () => {
      player.$state.providedDuration.set(Infinity);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(slider.getAttribute("aria-valuetext")).toBe("Rechtstreeks");
    await act(async () => i18n.setLocale("en-GB"));
    expect(slider.getAttribute("aria-valuetext")).toBe("Live");
    expect(ref.current).toBe(player);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
