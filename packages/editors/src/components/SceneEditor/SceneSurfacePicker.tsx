import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Raycaster, Vector2 } from "three";
import { findModelSurfacePoint } from "../../helpers/scene-annotation-creation";

export function SceneSurfacePicker({
  active,
  modelAnnotationIds,
  onPick,
}: {
  active: boolean;
  modelAnnotationIds: ReadonlySet<string>;
  onPick(point: [number, number, number]): void;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);

  useEffect(() => {
    if (!active) return;
    const element = gl.domElement;
    const cursor = element.style.cursor;
    let pointerDown: [number, number] | null = null;
    element.style.cursor = "crosshair";

    const pick = (event: MouseEvent) => {
      const start = pointerDown;
      pointerDown = null;
      if (!start || Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 5) return;
      const bounds = element.getBoundingClientRect();
      const pointer = new Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const point = findModelSurfacePoint(
        raycaster.intersectObjects(scene.children, true),
        modelAnnotationIds,
      );
      if (!point) return;
      event.stopImmediatePropagation();
      onPick(point);
    };

    const recordPointerDown = (event: PointerEvent) => {
      pointerDown = [event.clientX, event.clientY];
    };
    element.addEventListener("pointerdown", recordPointerDown, true);
    element.addEventListener("click", pick, true);
    return () => {
      element.removeEventListener("pointerdown", recordPointerDown, true);
      element.removeEventListener("click", pick, true);
      element.style.cursor = cursor;
    };
  }, [active, camera, gl, modelAnnotationIds, onPick, raycaster, scene]);

  return null;
}
