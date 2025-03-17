import { type BoxStyle, HTMLPortal, useAtlas } from "@atlas-viewer/atlas";
import { useEffect } from "react";
import { useSvgEditor } from "../hooks/use-svg-editor";

export const svgThemes = [
  {
    name: "Default",
    outer: { borderWidth: 4, borderColor: "rgba(255, 255, 255, .4)" },
    inner: { borderWidth: 2, borderColor: "#000" },
  },
  {
    name: "High contrast",
    outer: { borderWidth: 3, borderColor: "#fff" },
    inner: { borderWidth: 1, borderColor: "#000" },
  },
  {
    name: "Lightsaber",
    outer: { borderWidth: "4", borderColor: "rgba(56,68,255,0.64)" },
    inner: { borderWidth: "2", borderColor: "#fff" },
  },
  {
    name: "Bright",
    outer: { borderWidth: "6", borderColor: "#25d527" },
    inner: { borderWidth: "3", borderColor: "#a916ff" },
  },
  {
    name: "pink",
    outer: { borderWidth: "4", borderColor: "#ff00ff" },
    inner: { borderWidth: "2", borderColor: "#ffffff" },
  },
  {
    name: "fine (dark)",
    outer: { borderWidth: "1", borderColor: "#000000" },
    inner: {},
  },
  {
    name: "fine (light)",
    outer: { borderWidth: "1", borderColor: "#FFF" },
    inner: {},
  },
] as const;

export type SvgTheme = { name?: string; outer: BoxStyle; inner: BoxStyle };

export interface CreateCustomShapeProps {
  image: { width: number; height: number };
  theme?: { name?: string; outer: BoxStyle; inner: BoxStyle };
}

export function SVGAnnotationEditor(props: CreateCustomShapeProps) {
  const theme = props.theme || svgThemes[0];
  const atlas = useAtlas();
  const { image } = props;
  const {
    helper,
    defs,
    editor,
    state,
    transitionDirection,
    isSplitting,
    transitionRotate,
    isHoveringPoint,
    isAddingPoint,
    isStamping,
    currentShape,
  } = useSvgEditor({
    image: props.image,
    hideShapeLines: true,
  });

  const mouseMove = (e: any) => {
    helper.pointer([[~~e.atlas.x, ~~e.atlas.y]]);
  };

  useEffect(() => {
    const handler = (e: any) => {
      helper.key.up(e.key);
    };

    document.addEventListener("keyup", handler);
    return () => {
      document.removeEventListener("keyup", handler);
    };
  }, [helper]);

  useEffect(() => {
    const handler = (e: any) => {
      helper.key.down(e.key);
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [helper]);

  useEffect(() => {
    const wrapperClasses: Array<`atlas-cursor-${string}`> = [];
    if (transitionDirection) {
      wrapperClasses.push(`atlas-cursor-${transitionDirection}`);
    }
    if (state.actionIntentType === "cut-line" && state.modifiers?.Shift) {
      wrapperClasses.push("atlas-cursor-cut");
    }
    if (
      isHoveringPoint ||
      state.transitionIntentType === "move-shape" ||
      state.transitionIntentType === "move-point"
    ) {
      wrapperClasses.push("atlas-cursor-move");
    }
    if (isAddingPoint) {
      wrapperClasses.push("atlas-cursor-crosshair");
    }
    if (isSplitting) {
      wrapperClasses.push("atlas-cursor-copy");
    }
    if (transitionRotate) {
      wrapperClasses.push("atlas-cursor-rotate");
    }
    if (state.transitionIntentType === "draw-shape") {
      wrapperClasses.push("atlas-cursor-draw");
    }

    if (atlas?.canvas) {
      atlas.canvas.classList.add(...wrapperClasses);
    }
    return () => {
      if (atlas?.canvas) {
        atlas.canvas.classList.remove(...wrapperClasses);
      }
    };
  }, [
    atlas?.canvas,
    isAddingPoint,
    isHoveringPoint,
    isSplitting,
    state.modifiers?.Shift,
    state.actionIntentType,
    state.transitionIntentType,
    transitionDirection,
    transitionRotate,
  ]);
  const Shape = "shape" as any;

  return (
    <>
      <world-object
        height={image.height}
        width={image.width}
        onMouseMove={mouseMove}
        onMouseDown={helper.pointerDown}
        onMouseUp={helper.pointerUp}
        onMouseLeave={helper.blur}
      >
        {currentShape ? (
          <>
            <Shape
              open={currentShape.open}
              points={currentShape.points as any}
              relativeStyle={true}
              style={isStamping ? {} : (theme.outer as any)}
            />
            <Shape
              open={currentShape.open}
              points={currentShape.points as any}
              relativeStyle={true}
              style={isStamping ? {} : (theme.inner as any)}
            />
          </>
        ) : null}
        <HTMLPortal relative={true} interactive={false}>
          <div className="absolute top-0 right-0 left-0 bottom-0">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${image.width} ${image.height}`}
              tabIndex={-1}
            >
              <title>Annotation Editor</title>
              <defs>{defs}</defs>
              {editor}
            </svg>
          </div>
        </HTMLPortal>
      </world-object>
    </>
  );
}
