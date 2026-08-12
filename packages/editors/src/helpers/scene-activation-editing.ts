import { useSyncExternalStore } from "react";

export type SceneActivationEditingState = {
  sceneId: string;
  activationId: string;
  modelAnnotationId: string | null;
};

let state: SceneActivationEditingState | null = null;
const listeners = new Set<() => void>();

function update(next: SceneActivationEditingState | null) {
  state = next;
  for (const listener of listeners) listener();
}

export const sceneActivationEditing = {
  select(sceneId: string, activationId: string) {
    update({ sceneId, activationId, modelAnnotationId: null });
  },
  selectModel(modelAnnotationId: string | null) {
    if (state) update({ ...state, modelAnnotationId });
  },
  clear(sceneId?: string) {
    if (!sceneId || state?.sceneId === sceneId) update(null);
  },
  getSnapshot: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSceneActivationEditing() {
  return useSyncExternalStore(
    sceneActivationEditing.subscribe,
    sceneActivationEditing.getSnapshot,
    sceneActivationEditing.getSnapshot
  );
}
