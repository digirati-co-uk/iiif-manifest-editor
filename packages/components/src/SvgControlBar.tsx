import type { createHelper } from "polygon-editor";
import { useEffect } from "react";
import { RenderSvgEditorControls } from "react-iiif-vault";
import { DeleteForeverIcon } from "./icons/DeleteForeverIcon";
import { DrawIcon } from "./icons/DrawIcon";
import { HexagonIcon } from "./icons/HexagonIcon";
import { LineBoxIcon } from "./icons/LineBoxIcon";
import { LineIcon } from "./icons/LineIcon";
import { PolygonIcon } from "./icons/PolygonIcon";
import { ShapesIcon } from "./icons/ShapesIcon";
import { SquareIcon } from "./icons/SquareIcon";
import { TriangleIcon } from "./icons/TriangleIcon";

const className =
  'bg-me-gray-100 border hover:bg-me-gray-300 rounded p-1 text-2xl text-me-primary-500 data-[active="true"]:border-me-primary-600';

const icons = {
  DrawIcon: <DrawIcon />,
  PolygonIcon: <PolygonIcon />,
  LineIcon: <LineIcon />,
  LineBoxIcon: <LineBoxIcon />,
  ShapesIcon: <ShapesIcon />,
  SquareIcon: <SquareIcon />,
  TriangleIcon: <TriangleIcon />,
  HexagonIcon: <HexagonIcon />,
  DeleteForeverIcon: <DeleteForeverIcon />,
};

export function SvgControlBar({
  helper,
  showShapes,
}: {
  helper: ReturnType<typeof createHelper>;
  state: any;
  showShapes: any;
}) {
  useEffect(() => {
    helper.stamps.square();
  }, []);

  return (
    <RenderSvgEditorControls
      icons={icons}
      showShapes={showShapes}
      classNames={{
        button: className,
      }}
    />
  );
}
