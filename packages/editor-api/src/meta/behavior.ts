import type { InternationalString } from "@iiif/presentation-3";

export interface BehaviorChoice {
  id: string;
  label: InternationalString;
  type: "choice";
  addNone?: boolean;
  items: Array<{
    value: string;
    label: InternationalString;
  }>;
}

const autoAdvance = ["auto-advance", "no-auto-advance"] as const;

const repeat = ["repeat", "no-repeat"] as const;

const manifestOrdering = ["unordered", "individuals", "continuous", "paged"] as const;

const canvasOrdering = ["facing-pages", "paged", "non-paged"] as const;

const collection = ["multi-part", "together"] as const;

const range = ["sequence", "thumbnail-nav", "no-nav"] as const;

const hidden = ["hidden"] as const;

const collectionOrdering = manifestOrdering;

const rangeOrdering = manifestOrdering;

export const behaviors = {
  autoAdvance,
  repeat,
  manifestOrdering,
  collectionOrdering,
  rangeOrdering,
  canvasOrdering,
  collection,
  range,
  hidden,
};

export const supportedBehaviorGroups = {
  Collection: [collectionOrdering, collection, repeat, autoAdvance],
  Manifest: [manifestOrdering, repeat, autoAdvance],
  Canvas: [canvasOrdering, autoAdvance],
  Annotation: [hidden],
  AnnotationPage: [hidden],
  Range: [rangeOrdering, range, autoAdvance],
  AnnotationCollection: [hidden],
  ContentResource: [hidden],
};

function mapToItem(i: string) {
  return { label: { none: [i] }, value: i };
}

const autoAdvanceConfig: BehaviorChoice = {
  id: "@iiif/auto-advance",
  label: { en: ["Auto-advance"] },
  type: "choice",
  addNone: true,
  items: autoAdvance.map(mapToItem),
};

const repeatConfig: BehaviorChoice = {
  id: "@iiif/repeat",
  label: { en: ["Repeat"] },
  type: "choice",
  addNone: true,
  items: repeat.map(mapToItem),
};

const manifestOrderingConfig: BehaviorChoice = {
  id: "@iiif/manifest-ordering",
  label: { en: ["Manifest ordering"] },
  type: "choice",
  addNone: true,
  items: manifestOrdering.map(mapToItem),
};

const canvasOrderingConfig: BehaviorChoice = {
  id: "@iiif/canvas-ordering",
  label: { en: ["Canvas ordering"] },
  type: "choice",
  addNone: true,
  items: canvasOrdering.map(mapToItem),
};

const collectionConfig: BehaviorChoice = {
  id: "@iiif/range",
  label: { en: ["Collection"] },
  type: "choice",
  addNone: true,
  items: collection.map(mapToItem),
};

const rangeConfig: BehaviorChoice = {
  id: "@iiif/range",
  label: { en: ["Range"] },
  type: "choice",
  addNone: true,
  items: range.map(mapToItem),
};

const collectionOrderingConfig: BehaviorChoice = {
  id: "@iiif/collection-ordering",
  label: { en: ["Collection ordering"] },
  type: "choice",
  addNone: true,
  items: collectionOrdering.map(mapToItem),
};

const rangeOrderingConfig: BehaviorChoice = {
  id: "@iiif/range-ordering",
  label: { en: ["Range ordering"] },
  type: "choice",
  addNone: true,
  items: rangeOrdering.map(mapToItem),
};

const hiddenConfig: BehaviorChoice = {
  id: "@iiif/range-hidden",
  label: { en: ["Visibility"] },
  type: "choice",
  addNone: true,
  items: hidden.map(mapToItem),
};

export const supportedBehaviorConfig = {
  Collection: [collectionOrderingConfig, collectionConfig, repeatConfig, autoAdvanceConfig],
  Manifest: [manifestOrderingConfig, repeatConfig, autoAdvanceConfig],
  Canvas: [canvasOrderingConfig, autoAdvanceConfig],
  Annotation: [hiddenConfig],
  AnnotationPage: [hiddenConfig],
  Range: [rangeOrderingConfig, rangeConfig, autoAdvanceConfig],
  AnnotationCollection: [hiddenConfig],
  ContentResource: [hiddenConfig],
};
