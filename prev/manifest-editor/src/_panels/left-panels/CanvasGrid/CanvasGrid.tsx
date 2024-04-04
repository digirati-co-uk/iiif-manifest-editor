import { AppDropdownItem } from "@/_components/ui/AppDropdown/AppDropdown";
import { useManifestEditor } from "@/shell/EditingStack/EditingStack";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { toRef } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { useCallback, useMemo } from "react";
import { CanvasContext, useThumbnail } from "react-iiif-vault";
import { restrictToFirstScrollableAncestor, restrictToParentElement } from "@dnd-kit/modifiers";
import cx from "classnames";
import { canvasGridStyles as $ } from "./CanvasGrid.styles";
import { LazyCanvasThumbnail } from "@/components/widgets/IIIFExplorer/components/LazyCanvasThumbnail";

export interface CanvasGridProps {
  items: Array<Reference | SpecificResource>;
  onClick?: (ref: Reference | SpecificResource) => void;
  reorder?: (startIndex: number, endIndex: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
  createMultiActions?: (
    refs: Reference[],
    index: number,
    items: Array<Reference | SpecificResource>
  ) => AppDropdownItem[];
  options?: {
    enableKeyboardNavigation?: boolean;
    singleColumn: boolean;
    useRealThumbnails?: boolean;
    hideCanvasLabels?: boolean;
    grid?: boolean;
  };
}

export function ManifestItemsGrid() {
  const { structural } = useManifestEditor();
  const items = structural.items.get();

  return <CanvasGrid items={items} reorder={(start, end) => structural.items.reorder(start, end)} />;
}

export function CanvasGrid(props: CanvasGridProps) {
  const reorder = props.reorder;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const items = useMemo(() => {
    return (props.items || []).map((t) => {
      return toRef(t) as Reference;
    });
  }, [props.items]);

  const onDragEnd = useCallback(
    (result: DragEndEvent) => {
      const { active, over } = result;
      if (reorder && over && active.data.current?.ref !== over.data.current?.ref) {
        reorder(items.indexOf(active.data.current?.ref), items.indexOf(over.data.current?.ref));
      }
    },
    [items, reorder]
  );

  return (
    <div className={cx($.Container)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.map((item, index) => (
            <CanvasContext canvas={item.id} key={item.id}>
              <CanvasGridItem
                item={item}
                onClick={props.onClick}
                options={props.options}
                actions={props.createActions ? props.createActions(item, index, item) : undefined}
              />
            </CanvasContext>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface CanvasGridItemProps {
  item: Reference | SpecificResource;
  onClick?: (ref: Reference | SpecificResource) => void;
  actions?: AppDropdownItem[];
  isSelected?: boolean;
  options?: {
    realThumbnails?: boolean;
    hideCanvasLabels?: boolean;
  };
}

export function CanvasGridItem(props: CanvasGridItemProps) {
  const thumbnail = useThumbnail({ height: 128, width: 128 }, false);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id: props.item.id as any,
    data: { ref: props.item },
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={$.Item}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ ...style, height: 130, width: 130, background: "#eee" }}
    >
      <LazyCanvasThumbnail />
    </div>
  );
}
