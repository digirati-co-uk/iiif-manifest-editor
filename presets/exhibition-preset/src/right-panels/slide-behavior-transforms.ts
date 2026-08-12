export type LayoutPreset = "image" | "right" | "left" | "bottom" | "top";

export const positionBehaviors = new Set(["left", "right", "bottom", "top"]);
export const layoutBehaviors = new Set([...positionBehaviors, "image"]);
export const coverBehaviors = new Set(["cover", "image-cover"]);

function replaceBehaviorGroup(behavior: string[], group: Set<string>, replacement: string) {
  const firstIndex = behavior.findIndex((item) => group.has(item));
  const next = behavior.filter((item) => !group.has(item));
  next.splice(firstIndex < 0 ? next.length : firstIndex, 0, replacement);
  return next;
}

export function toggleBehaviorGroup(behavior: string[], group: Set<string>, replacement: string, enabled: boolean) {
  const firstIndex = behavior.findIndex((item) => group.has(item));
  const next = behavior.filter((item) => !group.has(item));
  if (enabled) next.splice(firstIndex < 0 ? next.length : firstIndex, 0, replacement);
  return next;
}

export function replaceLayoutBehavior(behavior: string[], layoutPreset: LayoutPreset) {
  return replaceBehaviorGroup(behavior, layoutPreset === "image" ? layoutBehaviors : positionBehaviors, layoutPreset);
}

export function toggleImageBehavior(behavior: string[], enabled: boolean) {
  return toggleBehaviorGroup(behavior, new Set(["image"]), "image", enabled);
}

export function toggleCoverBehavior(behavior: string[], enabled: boolean) {
  return toggleBehaviorGroup(behavior, coverBehaviors, "cover", enabled);
}
