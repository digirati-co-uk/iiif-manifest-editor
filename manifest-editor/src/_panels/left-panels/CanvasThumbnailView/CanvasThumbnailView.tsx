import { GridView } from "@/components/organisms/GridView/GridView";

export function CanvasThumbnailView(props: {
  width?: number;
  onCanvasClick: (canvasId: string) => void;
  onCanvasDoubleClick: (canvasId: string) => void;
}) {
  return (
    <GridView
      strip={true}
      width={props.width}
      handleChange={props.onCanvasClick}
      handleChangeDouble={props.onCanvasDoubleClick}
    />
  );
}
