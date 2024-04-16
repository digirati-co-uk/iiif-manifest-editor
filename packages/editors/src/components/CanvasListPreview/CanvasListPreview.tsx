import { Item, ItemMargin, Label } from "./CanvasListPreview.module.css";
import { useCanvas } from "react-iiif-vault";
import { getValue } from "@iiif/helpers";
import cx from "classnames";

interface CanvasListPreviewProps {
  onClick?: () => void;
  margin?: boolean;
  active?: boolean;
}

export function CanvasListPreview(props: CanvasListPreviewProps) {
  const canvas = useCanvas();

  return (
    <div className={cx(Item, props.margin && ItemMargin)} aria-selected={props.active} onClick={props.onClick}>
      <div className={Label}>{getValue(canvas?.label) || <span style={{ color: "#999" }}>Untitled canvas</span>}</div>
    </div>
  );
}
