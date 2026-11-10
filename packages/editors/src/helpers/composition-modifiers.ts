import type { createHelper } from "polygon-editor";

/** Adapt the viewer's per-pointer modifier refresh to composition's Shift-to-unlock convention. */
export function installCompositionModifiers(helper: ReturnType<typeof createHelper>, active: () => boolean) {
  const setModifier = helper.modifiers.set;
  const compositionModifier: typeof setModifier = (modifier) => {
    if (modifier === "Shift" && active()) {
      helper.modifiers.unset("Shift");
      return;
    }
    setModifier(modifier);
  };
  helper.modifiers.set = compositionModifier;
  return () => {
    if (helper.modifiers.set === compositionModifier) helper.modifiers.set = setModifier;
  };
}
