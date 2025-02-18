import {
  useMode,
  useRuntime,
  type Box,
  useFrame,
  useWorldEvent,
  BoundsContext,
} from "@atlas-viewer/atlas";
import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { useContext } from "react";
import { useModifierKeys } from "./use-modifier-keys";

function useCanvasPosition() {
  return useContext(BoundsContext);
}

export const useResizeWorldItem = (
  props: {
    x: number;
    y: number;
    width: number;
    height: number;
    maintainAspectRatio?: boolean;
    aspectRatio?: number;
  },
  onSave: (item: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void,
) => {
  const mode = useMode();
  const runtime = useRuntime();
  const canvasPosition = useCanvasPosition();
  const resizeMode = useRef<string>();
  const portalRef = useRef<Box | null>(null);
  const mouseStart = useRef<{ x: number; y: number } | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(false);

  const cardinalDeltas = useRef({ north: 0, south: 0, east: 0, west: 0 });
  const keys = useModifierKeys();

  const mouseEvent = useCallback(
    (direction: string) => (e: any) => {
      isEditingRef.current = true;
      setIsEditing(true);
      if (canvasPosition && runtime) {
        const { top, left } = canvasPosition;
        const current = runtime.viewerToWorld(e.pageX - left, e.pageY - top);
        mouseStart.current = { x: current.x, y: current.y };
        resizeMode.current = direction;
      }
    },
    [canvasPosition, runtime],
  );

  const aspectRatio = useMemo(() => {
    // Calculate aspect ratio.
    return props.width / props.height;
  }, [props.width, props.height]);

  const constrainToAspectRatio = useCallback(
    (deltas: { north: number; south: number; east: number; west: number }) => {
      const hasDeltas = Math.abs(
        deltas.north - deltas.south + (deltas.east - deltas.west),
      );
      if (!hasDeltas) return;

      const xDelta = -deltas.west + deltas.east;
      const yDelta = -deltas.north + deltas.south;

      const originalWidth = props.width + xDelta;
      const originalHeight = props.height + yDelta;

      const newAspectRatio = originalWidth / originalHeight;

      if (newAspectRatio >= aspectRatio) {
        // too wide
        const width = originalHeight * aspectRatio;
        const margin = originalWidth - width; // reduce by this amount.
        const [eastRatio, westRatio] = getRatio(deltas.east, deltas.west);

        deltas.west = deltas.west + margin * westRatio;
        deltas.east = deltas.east - margin * eastRatio;
      } else {
        // too tall
        const height = originalWidth / aspectRatio;
        const margin = originalHeight - height; // reduce by this amount.
        const [northRatio, southRatio] = getRatio(deltas.north, deltas.south);

        deltas.north = deltas.north + margin * northRatio;
        deltas.south = deltas.south - margin * southRatio;
      }
    },
    [props.width, props.height, aspectRatio],
  );

  useFrame(() => {
    if (mouseStart && runtime) {
      runtime.updateNextFrame();
    }
  });

  useEffect(() => {
    if (runtime) {
      runtime.updateNextFrame();
    }
  }, [runtime, isEditing]);

  const onPointerMoveCallback = useCallback(
    (e: any) => {
      if (!runtime || !canvasPosition || runtime.mode !== "sketch") return;

      const { top, left } = canvasPosition;
      const position = runtime.viewerToWorld(e.pageX - left, e.pageY - top);
      const box = portalRef.current;

      const alt = !props.maintainAspectRatio && keys.current.alt;
      const shift =
        !alt && keys.current.shift && resizeMode.current?.indexOf("-") !== -1;

      // Take co-ordinates, clamp constraints, update
      if (
        resizeMode.current === "translate" ||
        resizeMode.current === "east" ||
        resizeMode.current === "north-east" ||
        resizeMode.current === "south-east"
      ) {
        cardinalDeltas.current.east =
          position.x - (mouseStart.current ? mouseStart.current.x : 0);
        if (alt) {
          cardinalDeltas.current.west = -cardinalDeltas.current.east;
        }
      }
      if (
        resizeMode.current === "translate" ||
        resizeMode.current === "west" ||
        resizeMode.current === "north-west" ||
        resizeMode.current === "south-west"
      ) {
        cardinalDeltas.current.west =
          position.x - (mouseStart.current ? mouseStart.current.x : 0);
        if (alt) {
          cardinalDeltas.current.east = -cardinalDeltas.current.west;
        }
      }
      if (
        resizeMode.current === "translate" ||
        resizeMode.current === "north" ||
        resizeMode.current === "north-east" ||
        resizeMode.current === "north-west"
      ) {
        cardinalDeltas.current.north =
          position.y - (mouseStart.current ? mouseStart.current.y : 0);
        if (alt) {
          cardinalDeltas.current.south = -cardinalDeltas.current.north;
        }
      }
      if (
        resizeMode.current === "translate" ||
        resizeMode.current === "south" ||
        resizeMode.current === "south-west" ||
        resizeMode.current === "south-east"
      ) {
        cardinalDeltas.current.south =
          position.y - (mouseStart.current ? mouseStart.current.y : 0);
        if (alt) {
          cardinalDeltas.current.north = -cardinalDeltas.current.south;
        }
      }

      if (props.maintainAspectRatio || shift) {
        constrainToAspectRatio(cardinalDeltas.current);
      }

      if (box) {
        const dX1 = cardinalDeltas.current.west;
        const dY1 = cardinalDeltas.current.north;
        const dX2 = props.width + cardinalDeltas.current.east;
        const dY2 = props.height + cardinalDeltas.current.south;

        box.points[1] = Math.min(dX1, dX2);
        box.points[2] = Math.min(dY1, dY2);
        box.points[3] = Math.max(dX1, dX2);
        box.points[4] = Math.max(dY1, dY2);

        runtime.updateNextFrame();
      }
    },
    [
      runtime,
      props.width,
      props.height,
      props.maintainAspectRatio,
      canvasPosition,
    ],
  );

  useWorldEvent("mousemove", onPointerMoveCallback, [
    props.width,
    props.height,
    canvasPosition,
  ]);
  useWorldEvent("pointermove", onPointerMoveCallback, [
    props.width,
    props.height,
    canvasPosition,
  ]);

  const windowPointerUp = useRef<() => void>();

  useEffect(() => {
    windowPointerUp.current = () => {
      if (isEditingRef.current) {
        const dX1 = cardinalDeltas.current.west;
        const dY1 = cardinalDeltas.current.north;
        const dX2 = props.width + cardinalDeltas.current.east;
        const dY2 = props.height + cardinalDeltas.current.south;

        const x1 = Math.min(dX1, dX2);
        const y1 = Math.min(dY1, dY2);
        const x2 = Math.max(dX1, dX2);
        const y2 = Math.max(dY1, dY2);

        const realSize = {
          x: (props.x || 0) + x1,
          y: (props.y || 0) + y1,
          width: x2 - x1 || 1,
          height: y2 - y1 || 1,
        };
        if (props.maintainAspectRatio) {
          // @todo apply aspect ratio here.
          onSave(realSize);
        } else {
          onSave(realSize);
        }

        resizeMode.current = undefined;
        mouseStart.current = undefined;
        cardinalDeltas.current.east = 0;
        cardinalDeltas.current.west = 0;
        cardinalDeltas.current.north = 0;
        cardinalDeltas.current.south = 0;
        isEditingRef.current = false;
        setIsEditing(false);
      }
    };
  }, [onSave, props.height, props.width, props.x, props.y]);

  useEffect(() => {
    const cb = () => {
      if (windowPointerUp.current) {
        windowPointerUp.current();
      }
    };
    window.addEventListener("pointerup", cb);
    window.addEventListener("touchend", cb);
    return () => {
      window.removeEventListener("pointerup", cb);
      window.removeEventListener("touchend", cb);
    };
  }, []);

  return {
    portalRef,
    mode,
    mouseEvent,
    onPointerMoveCallback,
    isEditing,
  };
};
