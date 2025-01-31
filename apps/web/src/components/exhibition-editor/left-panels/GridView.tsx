import {
  LazyThumbnail,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import { useCreator, useManifestEditor } from "@manifest-editor/shell";
import { CanvasContext, useCanvas } from "react-iiif-vault";
import { getClassName } from "../helpers";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { useCallback } from "react";
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

export const id = "grid-view";

export const label = "Grid View";

export const icon = <>🤖</>;

export const render = () => <GridView />;

function GridView() {
  const manifest = useManifestEditor();
  const manifestId = manifest.technical.id.get();
  const manifestRef = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifestRef, "items", "Canvas");
  const { structural } = useManifestEditor();

  const { items: structure } = structural;
  const items = manifest.structural.items.get()

  return (
    <Sidebar>
      <SidebarHeader title="Grid View Sortable test" actions={[
        {
          icon: <NewSlideIcon />,
          title: "Add new slide",
          onClick: () => canvasActions.create(),
        },
      ]} />
      <SidebarContent>
        <div className="grid auto-rows-auto grid-cols-12 content-center justify-center gap-1 p-2">
          <div className="col-span-4 row-span-4 text-black bg-yellow-400 min-h-[100px] flex items-center justify-center">
            <div className="col-span-4 row-span-4 text-black bg-[yellow] min-h-[100px]">TITLE</div>
          </div>

          <ReorderCssGrid
            id={structure.focusId() || "reorder-css-grid"}
            items={items}
            inlineHandle={false}
            reorder={items ? (t) => structure.reorder(t.startIndex, t.endIndex) : undefined}
          />
          <div
            onClick={() => canvasActions.create()}
            className="col-span-4 row-span-2 border-2 border-dashed p-6 m-2 text-center border-black cursor-pointer flex items-center justify-center"
          >
            Add Slide
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}


interface ReorderCssGridProps<T extends { id: string; type?: string }> {
  id: string;
  items: T[];
  reorder: (result: { startIndex: number; endIndex: number }) => void;
}

function ReorderCssGrid<T extends { id: string; type?: string }>({ items, reorder }: ReorderCssGridProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = useCallback(
    (result: DragEndEvent) => {
      const { active, over } = result;
      if (over && active.id !== over.id) {
        reorder({
          startIndex: items.findIndex((item) => item.id === active.id),
          endIndex: items.findIndex((item) => item.id === over.id),
        });
      }
    },
    [items, reorder]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {items.map((item, idx) => {
          if (!item) return null;
          return (
            <CanvasContext key={item.id} canvas={item.id}>
              <SingleCanvas
                key={item.id}
                mref={item.id}
                item={item}
                isFirst={idx === 0}
                onClick={() => console.log("Clicked:", item.id)}
              />
            </CanvasContext>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

function SingleCanvas({ isFirst, onClick, mref, item }: { isFirst: boolean; onClick: () => void; mref: any; item: any }) {
  const canvas = useCanvas();
  const behavior = canvas?.behavior || [];
  const className = getClassName(canvas?.behavior, isFirst);
  const isLeft = behavior.includes("left");
  const isRight = behavior.includes("right");
  const isBottom = behavior.includes("bottom");
  const isTop = behavior.includes("top");
  const isInfo = behavior.includes("info");
  const isImage = behavior.includes("image") || (!isInfo && !isLeft && !isRight && !isBottom && !isTop);

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

  let children = null;
  if (isInfo) {
    children = <div className="bg-black w-full h-full text-white">TEXT</div>;
  } else {
    children = (
      <div
        className={`flex h-full max-h-full min-h-0 ${isBottom ? "flex-col" : "flex-row"} ${isLeft ? "flex-col-reverse" : ""}`}
      >
        <div className="flex-1 overflow-hidden relative justify-self-stretch">
          <div className="absolute inset-0 w-full h-full">
            <LazyThumbnail cover />
          </div>
        </div>
        {isImage ? null : (
          <div
            className={`${isBottom ? "min-h-3 w-full" : "w-1/3"} flex-shrink-0 self-stretch p-2 text-white bg-black rounded`}
          ></div>
        )}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className={`${className} bg-me-gray-700 overflow-hidden hover:ring-2 ring-me-primary-500`}>
      {children}
    </div>
  );
}
function NewSlideIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5f6368" viewBox="0 -960 960 960" >
      <path
        d="M160-240v-480 480Zm80-80v-200h360v200H240Zm-80 160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240h-80v-240H160v480h360v80H160Zm500-320v-100H360v-60h360v160h-60Zm60 400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
    </svg>
  );
}