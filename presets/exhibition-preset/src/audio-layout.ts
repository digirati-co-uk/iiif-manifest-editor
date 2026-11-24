import { floatingBehaviorOptions, type FloatingBehavior } from "./components/FloatingPositionPicker";
import type { LayoutPreset } from "./right-panels/slide-behavior-transforms";

/**
 * Layout choices that the exhibition viewer actually honours for an audio slide:
 * - full page: AudioBlock -> text left/right/top/bottom beside the player, plus grid width/height
 * - slideshow: AudioBlockPresentation -> text left/right/top/bottom, optionally floated over the player
 * - scroll: ScrollAudioBlock -> floating card (float-*) or a split section (left/right); default float-top-left
 */
export type AudioLayoutKind = "fullpage" | "slideshow" | "scroll";

export const audioPlacementOptions: Array<{ value: LayoutPreset; label: string }> = [
  { value: "image", label: "Player only" },
  { value: "top", label: "Text above player" },
  { value: "bottom", label: "Text below player" },
  { value: "left", label: "Text left of player" },
  { value: "right", label: "Text right of player" },
];

export const SCROLL_AUDIO_DEFAULT_POSITION: FloatingBehavior = "float-top-left";

const floatingValues = new Set<string>(floatingBehaviorOptions.map((option) => option.value));
const scrollPlacementValues = new Set(["left", "right", "floating", ...floatingValues]);

export type ScrollAudioPlacement =
  | { mode: "floating"; position: FloatingBehavior }
  | { mode: "left" | "right"; position: FloatingBehavior };

export function resolveAudioLayoutKind(controls: {
  showGridSizing: boolean;
  isSlideshow: boolean;
  scrollContext: boolean;
}): AudioLayoutKind {
  if (controls.isSlideshow) return "slideshow";
  if (controls.showGridSizing) return "fullpage";
  return controls.scrollContext ? "scroll" : "fullpage";
}

/** Mirrors ScrollAudioBlock/getScrollLayoutConfig: floating wins over split, nothing placed means a top-left card. */
export function getScrollAudioPlacement(behavior: string[]): ScrollAudioPlacement {
  const position =
    (behavior.find((item) => floatingValues.has(item)) as FloatingBehavior | undefined) ||
    (behavior.includes("floating") ? "float-bottom-left" : undefined);
  if (position || behavior.includes("floating")) return { mode: "floating", position: position || "float-bottom-left" };
  if (behavior.includes("left")) return { mode: "left", position: SCROLL_AUDIO_DEFAULT_POSITION };
  if (behavior.includes("right")) return { mode: "right", position: SCROLL_AUDIO_DEFAULT_POSITION };
  return { mode: "floating", position: SCROLL_AUDIO_DEFAULT_POSITION };
}

export function setScrollAudioPlacement(behavior: string[], next: ScrollAudioPlacement) {
  const rest = behavior.filter((item) => !scrollPlacementValues.has(item));
  return [...rest, next.mode === "floating" ? next.position : next.mode];
}

/** Slideshow overlay: the viewer floats the text panel only when it has a text placement to float. */
export function setAudioOverlay(behavior: string[], position: FloatingBehavior | null) {
  const rest = behavior.filter((item) => item !== "floating" && !floatingValues.has(item));
  return position ? [...rest, position] : rest;
}

export const audioWidthOptions = [
  { value: 12, label: "Full width" },
  { value: 8, label: "2/3 width" },
  { value: 6, label: "Half width" },
  { value: 4, label: "1/3 width" },
] as const;

export const audioHeightOptions = [
  { value: 4, label: "Short" },
  { value: 6, label: "Medium" },
  { value: 8, label: "Tall" },
  { value: 10, label: "Extra tall" },
] as const;

export function getGridUnit(behavior: string[], prefix: "w-" | "h-", fallback: number) {
  const found = [...behavior].reverse().find((item) => new RegExp(`^${prefix}\\d+$`).test(item));
  return found ? Number(found.slice(2)) : fallback;
}

export function setGridUnit(behavior: string[], prefix: "w-" | "h-", value: number) {
  return [...behavior.filter((item) => !item.startsWith(prefix)), `${prefix}${value}`];
}
