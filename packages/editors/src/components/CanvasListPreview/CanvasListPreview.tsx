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
    //
    <button
      data-canvas-selected={props.active}
      className={cx(Item, props.margin && ItemMargin)}
      aria-selected={props.active}
      onClick={props.onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
        <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
      </svg>
      <div className={Label}>{getValue(canvas?.label) || <span style={{ color: "#999" }}>Untitled canvas</span>}</div>
    </button>
  );
}
