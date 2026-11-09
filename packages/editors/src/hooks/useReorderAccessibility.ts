import { useTranslations } from "@manifest-editor/i18n";
import type { ComponentProps } from "react";
import type { DndContext } from "@dnd-kit/core";

/** Positions are display ordinals; resource IDs never become translated labels. */
export function useReorderAccessibility(
  items: readonly { id: string }[]
): ComponentProps<typeof DndContext>["accessibility"] {
  const t = useTranslations("editors");
  const position = (id: string | number) => items.findIndex((item) => item.id === id) + 1;
  return {
    screenReaderInstructions: { draggable: t("reorder.instructions") },
    announcements: {
      onDragStart: ({ active }) => t("reorder.start", { position: position(active.id) }),
      onDragOver: ({ over }) => (over ? t("reorder.over", { position: position(over.id) }) : t("reorder.outside")),
      onDragEnd: ({ over }) => (over ? t("reorder.end", { position: position(over.id) }) : t("reorder.cancel")),
      onDragCancel: () => t("reorder.cancel"),
    },
  };
}
