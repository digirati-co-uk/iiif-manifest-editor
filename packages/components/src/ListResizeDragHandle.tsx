import { Button } from "react-aria-components";
import { ResizeHandleIcon } from "./icons/ResizeHandleIcon";

export function ListResizeDragHandle() {
  return (
    <Button slot="drag" className="rounded-sm cursor-move bg-transparent text-gray-500 hover:bg-gray-300">
      <ResizeHandleIcon className="text-xl cursor-move" />
    </Button>
  );
}
