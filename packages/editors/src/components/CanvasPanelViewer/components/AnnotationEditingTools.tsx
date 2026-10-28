import { useEditorsTranslations as useTranslations } from "../../../editor-i18n-context";
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

export function AnnotationEditingTools({ forceVisible = false }: { forceVisible?: boolean }) {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const store = useAtlasStore();
  const tool = useStore(store, (s) => s.tool);
  const mode = useStore(store, (s) => s.mode);
  const changeMode = useStore(store, (s) => s.changeMode);
  const tools = useSvgTools();
  const toolType = useStore(store, (s) => (s.tool.requestId ? s.requests[s.tool.requestId]?.type : undefined));
  const { remove, draw, hexagon, line, lineBox, polygon, square, triangle, circle } = tools;

  if (!tool.enabled && !forceVisible) {
    return null;
  }

  return (
    <div className="animate-fadeIn absolute bottom-3 left-0 right-0 z-30 flex w-full items-center justify-center gap-5 pointer-events-none">
      <div className="rounded-lg bg-white flex p-1.5 shadow gap-1.5 pointer-events-auto">
        <IconButton onPress={() => changeMode("explore")} active={mode === "explore"} label={t("ui.panAndZoom")}>
          <PanIcon />
        </IconButton>

        <IconButton onPress={() => changeMode("sketch")} active={mode === "sketch"} label={commonT("actions.select")}>
          <CusorIcon />
        </IconButton>

        <IconButton
          disabled={!remove.active}
          label={commonT("actions.delete")}
          onPress={() => {
            if (confirm(t("messages.deleteAnnotationConfirm"))) {
              remove.enable();
            }
          }}
        >
          <DeleteForeverIcon />
        </IconButton>
      </div>
      <div className="rounded-lg bg-white flex p-1.5 shadow gap-1.5 pointer-events-auto">
        <IconButton label={t("ui.drawABox")} onPress={square.enable} active={square.active}>
          <SquareIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label={t("ui.polygonTool")}
          onPress={polygon.enable}
          active={polygon.active}
        >
          <PolygonIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label={t("ui.drawTool")}
          onPress={draw.enable}
          active={draw.active}
        >
          <DrawIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label={t("ui.lineTool")}
          onPress={line.enable}
          active={line.active}
        >
          <LineIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label={t("ui.lineboxTool")}
          onPress={lineBox.enable}
          active={lineBox.active}
        >
          <LineBoxIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label={t("ui.createTriangle")}
          onPress={triangle.enable}
          active={triangle.active}
        >
          <TriangleIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label={t("ui.createHexagon")}
          onPress={hexagon.enable}
          active={hexagon.active}
        >
          <HexagonIcon />
        </IconButton>
        <IconButton
          disabled={toolType === "target"}
          label={t("ui.createCircle")}
          onPress={circle.enable}
          active={circle.active}
        >
          <CircleIcon />
        </IconButton>
      </div>
    </div>
  );
}
