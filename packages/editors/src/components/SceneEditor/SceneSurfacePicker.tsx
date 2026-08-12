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
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        return;
      const pointer = new Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const point = findModelSurfacePoint(
        raycaster.intersectObjects(scene.children, true),
        modelAnnotationIds,
      );
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!point) return;
      onPick(point);
    };

    const recordPointerDown = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      pointerDown =
        event.button === 0 &&
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
          ? [event.clientX, event.clientY]
          : null;
    };
    window.addEventListener("pointerdown", recordPointerDown, true);
    window.addEventListener("click", pick, true);
    return () => {
      window.removeEventListener("pointerdown", recordPointerDown, true);
      window.removeEventListener("click", pick, true);
      element.style.cursor = cursor;
    };
  }, [active, camera, gl, modelAnnotationIds, onPick, raycaster, scene]);

  return null;
}
