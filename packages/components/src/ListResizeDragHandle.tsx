import { useTranslations } from "@manifest-editor/i18n";
import { Button } from "react-aria-components";
import { ResizeHandleIcon } from "./icons/ResizeHandleIcon";

export function ListResizeDragHandle() {
  const t = useTranslations("components");
  return (
    <Button
      aria-label={t("actions.reorder")}
      slot="drag"
      className="rounded-sm cursor-move bg-transparent text-gray-500 hover:bg-gray-300"
    >
      <ResizeHandleIcon aria-hidden="true" className="text-xl cursor-move" />
    </Button>
  );
}
