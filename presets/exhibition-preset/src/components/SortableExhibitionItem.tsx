import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreMenu } from "@manifest-editor/components";
import { AppDropdown, type AppDropdownItem } from "@manifest-editor/editors";
import { Button } from "react-aria-components";
import { ResizeHandleIcon } from "../icons/ResizeHandleIcon";
import { ExhibitionItem } from "./ExhibitionItem";

export function SortableExhibitionItem({
  isFirst,
  onClick,
  item,
  actions,
}: {
  isFirst: boolean;
  onClick: () => void;
  item: { id: string };
  actions?: AppDropdownItem[];
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
      <div className="absolute top-0.5 right-0.5 flex gap-0.5 items-stretch">
        {actions?.length ? (
          <AppDropdown
            as={Button}
            className="bg-white p-1 text-2xl hover:text-me-500 aria-expanded:text-me-600 aria-expanded:bg-me-200 hover:bg-me-100  rounded-sm"
            aria-label="Action menu"
            items={actions}
          >
            <MoreMenu />
          </AppDropdown>
        ) : null}
        <div className="bg-white text-2xl h-8 flex items-center p-1 hover:text-me-500 hover:bg-me-100 rounded-sm">
          <ResizeHandleIcon aria-label="Reorder item" />
        </div>
      </div>
    </ExhibitionItem>
  );
}
