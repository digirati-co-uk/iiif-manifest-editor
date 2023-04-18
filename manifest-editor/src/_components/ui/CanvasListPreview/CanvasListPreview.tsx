import { canvasListPreviewStyles as $ } from "./CanvasListPreview.styles";
import { useCanvas } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import cx from "classnames";

interface CanvasListPreviewProps {
  onClick?: () => void;
  margin?: boolean;
}

export function CanvasListPreview(props: CanvasListPreviewProps) {
  const canvas = useCanvas();

  return (
    <div className={cx($.Item, props.margin && $.ItemMargin)} onClick={props.onClick}>
      <div className={$.Label}>{getValue(canvas?.label) || <span style={{ color: '#999' }}>Untitled canvas</span>}</div>
    </div>
  );
}
