import type { MessageReference } from "../../i18n/src/types";
import type { DisplayMessageReference } from "../src/meta/display";
import type { BehaviorChoice } from "../src/meta/behavior";
import type { DocDefinition } from "../src/meta/documentation";
import type { CanvasLayout, CanvasSizePreset } from "../src/canvas-layout/geometry";
import type { CCDefinition } from "../src/meta/rights";

type Assert<T extends true> = T;
export type PublicReferenceCompatibility = Assert<DisplayMessageReference extends MessageReference ? true : false>;
export type PublicReferenceCompatibilityReverse = Assert<
  MessageReference extends DisplayMessageReference ? true : false
>;

// Third-party definitions compiled without any translation metadata.
export const legacyChoice: BehaviorChoice = {
  id: "custom",
  label: { cy: ["Dewis"] },
  type: "choice",
  items: [{ value: "custom", label: { none: ["Custom"] } }],
};
export const legacyDoc: DocDefinition = { link: "https://example.org", summary: "Custom" };
export const legacyLayout: CanvasLayout = { id: "custom", label: "Custom", slots: [] };
export const legacySize: CanvasSizePreset = { label: "Custom", columns: 3, rows: 5 };
export const legacyRights: CCDefinition = {
  label: "Custom",
  shortLabel: "C",
  description: "Custom",
  icon: "",
  value: "",
  url: "",
  legal: "",
};
