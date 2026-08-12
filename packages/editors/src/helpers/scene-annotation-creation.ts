import { useSyncExternalStore } from "react";
import type { Intersection, Object3D } from "three";

export type SceneAnnotationDraft = {
  sceneId: string;
  pageId: string;
  point: [number, number, number] | null;
};

let draft: SceneAnnotationDraft | null = null;
const listeners = new Set<() => void>();

function update(next: SceneAnnotationDraft | null) {
  draft = next;
  for (const listener of listeners) listener();
}

export const sceneAnnotationCreation = {
  start(sceneId: string, pageId: string) {
    update({ sceneId, pageId, point: null });
  },
  pick(sceneId: string, point: [number, number, number]) {
    if (draft?.sceneId === sceneId) update({ ...draft, point });
  },
  cancel() {
    update(null);
  },
  getSnapshot: () => draft,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSceneAnnotationCreation() {
  return useSyncExternalStore(
    sceneAnnotationCreation.subscribe,
    sceneAnnotationCreation.getSnapshot,
    sceneAnnotationCreation.getSnapshot,
  );
}

export function findModelSurfacePoint(
  intersections: readonly Pick<Intersection, "object" | "point">[],
  modelAnnotationIds: ReadonlySet<string>,
): [number, number, number] | null {
  for (const intersection of intersections) {
    let object: Object3D | null = intersection.object;
    while (object) {
      if (object.userData.rivSceneEditorHelper) break;
      const ids = object.userData.iiifIds;
      if (Array.isArray(ids) && ids.some((id) => modelAnnotationIds.has(id))) {
        return intersection.point.toArray();
      }
      object = object.parent;
    }
  }
  return null;
}

export function scenePointTarget(sceneId: string, point: readonly [number, number, number]) {
  return {
    type: "SpecificResource",
    source: { id: sceneId, type: "Scene" },
    selector: { type: "PointSelector", x: point[0], y: point[1], z: point[2] },
  };
}
