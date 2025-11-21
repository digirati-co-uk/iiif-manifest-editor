import { IconButton } from "@manifest-editor/components";
import { useAtlasStore, useSvgTools } from "@manifest-editor/shell";
import { useStore } from "zustand";
import {
  CircleIcon,
  CusorIcon,
  DeleteForeverIcon,
  DrawIcon,
  HexagonIcon,
  LineBoxIcon,
  LineIcon,
  PanIcon,
  PolygonIcon,
  SquareIcon,
  TriangleIcon,
} from "./SVGIcons";

export function AnnotationEditingTools() {
  const store = useAtlasStore();
  const tool = useStore(store, (s) => s.tool);
  const mode = useStore(store, (s) => s.mode);
  const changeMode = useStore(store, (s) => s.changeMode);
  const tools = useSvgTools();
  const toolType = useStore(store, (s) => (s.tool.requestId ? s.requests[s.tool.requestId]?.type : undefined));
  const { remove, draw, hexagon, line, lineBox, polygon, square, triangle, circle } = tools;

  if (!tool.enabled) {
    return null;
  }

  return (
    <div className="animate-fadeIn absolute bottom-3 left-0 right-0 z-30 w-full items-center justify-center flex gap-5 pointer-events-none">
      <div className="rounded-lg bg-white flex p-1.5 shadow gap-1.5 pointer-events-auto">
        <IconButton onPress={() => changeMode("explore")} active={mode === "explore"} label="Pan and zoom">
          <PanIcon />
        </IconButton>

        <IconButton onPress={() => changeMode("sketch")} active={mode === "sketch"} label="Select">
          <CusorIcon />
        </IconButton>

        <IconButton
          disabled={!remove.active}
          label="Delete"
          onPress={() => {
            if (confirm("Are you sure you want to delete this annotation?")) {
              remove.enable();
            }
          }}
        >
          <DeleteForeverIcon />
        </IconButton>
      </div>
      <div className="rounded-lg bg-white flex p-1.5 shadow gap-1.5 pointer-events-auto">
        <IconButton label="Draw a box" onPress={square.enable} active={square.active}>
          <SquareIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label="Polygon tool"
          onPress={polygon.enable}
          active={polygon.active}
        >
          <PolygonIcon />
        </IconButton>
        <IconButton disabled={toolType === "target"} label="Draw tool" onPress={draw.enable} active={draw.active}>
          <DrawIcon />
        </IconButton>
        <IconButton disabled={toolType === "target"} label="Line tool" onPress={line.enable} active={line.active}>
          <LineIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label="Line-box tool"
          onPress={lineBox.enable}
          active={lineBox.active}
        >
          <LineBoxIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label="Create Triangle"
          onPress={triangle.enable}
          active={triangle.active}
        >
          <TriangleIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label="Create Hexagon"
          onPress={hexagon.enable}
          active={hexagon.active}
        >
          <HexagonIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label="Create circle"
          onPress={circle.enable}
          active={circle.active}
        >
          <CircleIcon />
        </IconButton>
      </div>
    </div>
  );
}
