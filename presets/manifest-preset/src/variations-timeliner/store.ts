import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TIMELINER_SIDEBAR_ID = "@manifest-editor/variations-timeliner-panel";
export const TIMELINER_CENTER_ID = "variations-timeliner";
export const TIMELINER_SECTION_PANEL_ID = "@manifest-editor/variations-timeliner-section";

export const DEFAULT_VIEWPORT_HEIGHT = 260;
export const MIN_VIEWPORT_HEIGHT = 140;
export const MAX_VIEWPORT_HEIGHT = 720;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 12;

type Theme = { palette: string; background: string; square: boolean; monochrome: boolean };
/** View preferences remembered across page reloads (local storage). */
type Preferences = Theme & {
  /** Height of the bubble viewport in pixels. */
  viewportHeight: number;
  /** Zoom level per media canvas. */
  zooms: Record<string, number>;
  speed: number;
  volume: number;
  muted: boolean;
  loop: boolean;
};

interface TimelinerStore extends Preferences {
  /** Which A/V canvas is being worked on. */
  canvasId: string | null;
  /** Selected section (range) ids. */
  selected: string[];
  /** Playhead, published by the centre panel so the sidebar and section editor can use it. */
  time: number;
  seekTo: ((time: number) => void) | null;
  setCanvasId: (id: string | null) => void;
  select: (ids: string[]) => void;
  setTime: (time: number) => void;
  setSeek: (seek: ((time: number) => void) | null) => void;
  setTheme: (theme: Partial<Theme>) => void;
  setViewportHeight: (height: number) => void;
  setZoom: (canvasId: string, zoom: number) => void;
  setPlayback: (playback: Partial<Pick<Preferences, "speed" | "volume" | "muted" | "loop">>) => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const useTimelinerStore = create<TimelinerStore>()(
  persist(
    (set) => ({
      canvasId: null,
      selected: [],
      time: 0,
      seekTo: null,
      palette: "default",
      background: "#ffffff",
      square: false,
      monochrome: false,
      viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
      zooms: {},
      speed: 1,
      volume: 1,
      muted: false,
      loop: false,
      setCanvasId: (canvasId) => set({ canvasId, selected: [], time: 0 }),
      select: (selected) => set({ selected }),
      setTime: (time) => set({ time }),
      setSeek: (seekTo) => set({ seekTo }),
      setTheme: (theme) => set(theme),
      setViewportHeight: (height) =>
        set({ viewportHeight: Math.round(clamp(height, MIN_VIEWPORT_HEIGHT, MAX_VIEWPORT_HEIGHT)) }),
      setZoom: (canvasId, zoom) =>
        set((state) => ({ zooms: { ...state.zooms, [canvasId]: clamp(zoom, MIN_ZOOM, MAX_ZOOM) } })),
      setPlayback: (playback) => set(playback),
    }),
    {
      name: "manifest-editor:variations-timeliner",
      partialize: ({
        palette,
        background,
        square,
        monochrome,
        viewportHeight,
        zooms,
        speed,
        volume,
        muted,
        loop,
      }): Preferences => ({
        palette,
        background,
        square,
        monochrome,
        viewportHeight,
        zooms,
        speed,
        volume,
        muted,
        loop,
      }),
    }
  )
);
