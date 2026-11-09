import type { DisplayMessageReference } from "./display";
import type { InternationalString } from "@iiif/presentation-3";

export interface BehaviorChoice {
  id: string;
  label: InternationalString;
  labelMessage?: DisplayMessageReference;
  type: "choice";
  addNone?: boolean;
  groupBehavior?: string;
  items: Array<{
    value: string;
    label: InternationalString;
    labelMessage?: DisplayMessageReference;
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
  return { label: { none: [i] }, value: i, labelMessage: { namespace: "editor-api", key: `behavior.values.${i}` } };
}

const autoAdvanceConfig: BehaviorChoice = {
  id: "@iiif/auto-advance",
  label: { en: ["Auto-advance"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.autoAdvance" },
  type: "choice",
  addNone: true,
  items: autoAdvance.map(mapToItem),
};

const repeatConfig: BehaviorChoice = {
  id: "@iiif/repeat",
  label: { en: ["Repeat"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.repeat" },
  type: "choice",
  addNone: true,
  items: repeat.map(mapToItem),
};

const manifestOrderingConfig: BehaviorChoice = {
  id: "@iiif/manifest-ordering",
  label: { en: ["Manifest ordering"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.manifestOrdering" },
  type: "choice",
  addNone: true,
  items: manifestOrdering.map(mapToItem),
};

const canvasOrderingConfig: BehaviorChoice = {
  id: "@iiif/canvas-ordering",
  label: { en: ["Canvas ordering"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.canvasOrdering" },
  type: "choice",
  addNone: true,
  items: canvasOrdering.map(mapToItem),
};

const collectionConfig: BehaviorChoice = {
  id: "@iiif/range",
  label: { en: ["Collection"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.collection" },
  type: "choice",
  addNone: true,
  items: collection.map(mapToItem),
};

const rangeConfig: BehaviorChoice = {
  id: "@iiif/range",
  label: { en: ["Range"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.range" },
  type: "choice",
  addNone: true,
  items: range.map(mapToItem),
};

const collectionOrderingConfig: BehaviorChoice = {
  id: "@iiif/collection-ordering",
  label: { en: ["Collection ordering"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.collectionOrdering" },
  type: "choice",
  addNone: true,
  items: collectionOrdering.map(mapToItem),
};

const rangeOrderingConfig: BehaviorChoice = {
  id: "@iiif/range-ordering",
  label: { en: ["Range ordering"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.rangeOrdering" },
  type: "choice",
  addNone: true,
  items: rangeOrdering.map(mapToItem),
};

const hiddenConfig: BehaviorChoice = {
  id: "@iiif/range-hidden",
  label: { en: ["Visibility"] },
  labelMessage: { namespace: "editor-api", key: "behavior.groups.hidden" },
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
