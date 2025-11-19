import { getValue } from "@iiif/helpers";
import cx from "classnames";
import { LocaleString, useCanvas } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { EditableCanvasLabel } from "../EditableCanvasLabel";

interface CanvasListPreviewProps {
  onClick?: () => void;
  margin?: boolean;
  active?: boolean;
  editing?: boolean;
}

export function CanvasListPreview(props: CanvasListPreviewProps) {
  const canvas = useCanvas();

  return (
    <button
      data-canvas-selected={props.active}
      className={twMerge(
        cx(
          "p-1.5 cursor-pointer flex gap-1.5 bg-white border-b border-gray-200 w-full hover:bg-gray-50",
          props.active && "bg-gray-50 text-black border-[#892c4e]",
        ),
      )}
      aria-selected={props.active}
      onClick={props.onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="currentColor"
        className={twMerge(cx("text-gray-300", props.active && "text-[#b84c74]"))}
      >
        <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
      </svg>
      <div className="text-base text-ellipsis whitespace-nowrap overflow-hidden flex-1 min-w-0 text-start">
        {props.editing ? (
          <EditableCanvasLabel buttonClassName="w-full block" className="w-full block" placeholder="Untitled canvas" />
        ) : (
          <LocaleString defaultText={(<span className="text-gray-500">Untitled canvas</span>) as any}>
            {canvas?.label}
          </LocaleString>
        )}
      </div>
    </button>
  );
}
