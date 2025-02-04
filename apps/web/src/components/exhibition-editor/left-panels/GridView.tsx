import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LazyThumbnail,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@manifest-editor/components";
import { createAppActions, useToggleList } from "@manifest-editor/editors";
import { useCreator, useManifestEditor } from "@manifest-editor/shell";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { MoreMenu } from "@manifest-editor/ui/icons/MoreMenu";
import { useCallback } from "react";
import { CanvasContext, useCanvas } from "react-iiif-vault";
import { AppDropdown, AppDropdownItem } from "../../../../../../packages/editors/src/components/AppDropdown/AppDropdown";
import { getClassName } from "../helpers";

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
  const [toggled, toggle] = useToggleList();

  console.log(toggled)

  const { items: structure } = structural;
  const items = manifest.structural.items.get()

  return (
    <Sidebar>
      <SidebarHeader title="Grid View Sortable test" actions={[
        {
          icon: <ListEditIcon />,
          title: "Edit slides",
          toggled: toggled.items,
          onClick: () => toggle("items"),
        },
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
            reorder={(t) => structure.reorder(t.startIndex, t.endIndex)}
            createActions={createAppActions(structure)}
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
  createActions?: (ref: T, index: number, item: T) => AppDropdownItem[];
}

function ReorderCssGrid<T extends { id: string; type?: string }>({ items, reorder, createActions }: ReorderCssGridProps<T>) {
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
            <CanvasContext key={item.id} canvas={item.id} >
                <SingleCanvas
                  key={item.id}
                  mref={item.id}
                  item={item}
                  isFirst={idx === 0}
                  onClick={() => console.log("Clicked:", item.id)}
                  actions={ createActions ? createActions(item, idx, item) : undefined}
                />
            </CanvasContext>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

function SingleCanvas({ isFirst, onClick, mref, item, actions }: { isFirst: boolean; onClick: () => void; mref: any; item: any;   actions?: AppDropdownItem[]; }) {
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
  const Component =  "div";


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
    <Component  ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className={`${className} bg-me-gray-700 overflow-hidden hover:ring-2 ring-me-primary-500 relative`}>
      {actions?.length ? (
        <AppDropdown items={actions} style={{ position: 'absolute', right: 0, zIndex: 2}}>
          <MoreMenu />
        </AppDropdown>
      ) : null}
      {children}
    </Component>
  );
}
function ListEditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
    </svg>
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
