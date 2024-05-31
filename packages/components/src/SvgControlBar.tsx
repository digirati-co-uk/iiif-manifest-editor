import { RenderSvgEditorControls } from "react-iiif-vault";
import { DrawIcon } from "./icons/DrawIcon";
import { PolygonIcon } from "./icons/PolygonIcon";
import { LineIcon } from "./icons/LineIcon";
import { LineBoxIcon } from "./icons/LineBoxIcon";
import { ShapesIcon } from "./icons/ShapesIcon";
import { SquareIcon } from "./icons/SquareIcon";
import { TriangleIcon } from "./icons/TriangleIcon";
import { HexagonIcon } from "./icons/HexagonIcon";
import { DeleteForeverIcon } from "./icons/DeleteForeverIcon";
import { useEffect } from "react";
import { createHelper } from "polygon-editor";

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
  state,
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
      helper={helper}
      state={state}
      showShapes={showShapes}
      classNames={{
        button: className,
      }}
    />
  );
}
