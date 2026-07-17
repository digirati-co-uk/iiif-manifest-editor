import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreMenu } from "@manifest-editor/components";
import { AppDropdown, type AppDropdownItem } from "@manifest-editor/editors";
import { Button } from "react-aria-components";
import { ResizeHandleIcon } from "../icons/ResizeHandleIcon";
import { ExhibitionItem } from "./ExhibitionItem";
import { ExhibitionPreviewCard, type PreviewMode } from "./ExhibitionPreviewList";

export function SortableExhibitionItem({
  isFirst,
  onClick,
  item,
  actions,
  mode,
}: {
  isFirst: boolean;
  onClick: () => void;
  item: { id: string };
  actions?: AppDropdownItem[];
  mode?: PreviewMode;
}) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
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

  const controls = (
    <div
      className="absolute right-0.5 top-0.5 z-30 flex items-stretch gap-0.5"
      onClick={(event) => event.stopPropagation()}
    >
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
      <Button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Reorder item"
        className="flex h-8 cursor-grab items-center rounded-sm bg-white p-1 text-2xl hover:bg-me-100 hover:text-me-500 focus:outline focus:outline-2 focus:outline-me-primary-500 active:cursor-grabbing"
      >
        <ResizeHandleIcon aria-hidden="true" />
      </Button>
    </div>
  );

  if (mode) {
    return (
      <div ref={setNodeRef} style={style} className="relative">
        <ExhibitionPreviewCard mode={mode} onClick={onClick} />
        {controls}
      </div>
    );
  }

  return (
    <ExhibitionItem ref={setNodeRef} style={style} onClick={onClick} isFirst={isFirst} item={item}>
      {controls}
    </ExhibitionItem>
  );
}
