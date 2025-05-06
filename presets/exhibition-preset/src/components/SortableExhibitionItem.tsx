import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ResizeHandleIcon } from "../icons/ResizeHandleIcon";
import { ExhibitionItem } from "./ExhibitionItem";

export function SortableExhibitionItem({
  isFirst,
  onClick,
  item,
}: {
  isFirst: boolean;
  onClick: () => void;
  item: { id: string };
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <ExhibitionItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      isFirst={isFirst}
      item={item}
    >
      <div className="absolute bg-white text-2xl p-1 top-0.5 right-0.5">
        <ResizeHandleIcon aria-label="Reorder item" />
      </div>
    </ExhibitionItem>
  );
}
