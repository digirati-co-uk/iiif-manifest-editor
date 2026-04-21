import {
  type DragEndEvent,
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { InternationalString, MetadataItem } from "@iiif/presentation-3";
import {
  ActionButton,
  AddIcon,
  EmptyState,
  HandleContainer,
  MoreMenu,
  PaddedSidebarContainer,
} from "@manifest-editor/components";
import { useEditor } from "@manifest-editor/shell";
import { ButtonReset } from "@manifest-editor/ui/atoms/Button";
import { DeleteIcon } from "@manifest-editor/ui/icons/DeleteIcon";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { EditIcon } from "@manifest-editor/ui/icons/EditIcon";
import { ResetIcon } from "@manifest-editor/ui/icons/ResetIcon";
import { ResizeHandleIcon } from "@manifest-editor/ui/icons/ResizeHandleIcon";
import { TickIcon } from "@manifest-editor/ui/icons/TickIcon";
import DOMPurify from "dompurify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppDropdown,
  type AppDropdownItem,
} from "../../components/AppDropdown/AppDropdown";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";

type SortableMetadataItem = { id: string } & MetadataItem;

const emptyLanguageMap = { none: [] };

function firstLanguageValue(value: InternationalString | null | undefined) {
  if (!value) {
    return "";
  }

  for (const lang of Object.keys(value)) {
    const values = value[lang] || [];
    const firstValue = values.find((item) => item.trim().length > 0);

    if (firstValue) {
      return firstValue;
    }
  }

  return "";
}

function previewText(value: InternationalString | null | undefined) {
  const text = firstLanguageValue(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "\n");

  return DOMPurify.sanitize(text, {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
  }).trim();
}

function MetadataActionMenu({
  index,
  itemCount,
  onDelete,
  onMoveToEnd,
  onMoveToStart,
}: {
  index: number;
  itemCount: number;
  onDelete: () => void;
  onMoveToEnd: () => void;
  onMoveToStart: () => void;
}) {
  const items: AppDropdownItem[] = [
    ...(itemCount > 1
      ? [
          {
            label: "Move to start",
            icon: <ResetIcon />,
            onClick: onMoveToStart,
          },
          {
            label: "Move to end",
            icon: <DownIcon />,
            onClick: onMoveToEnd,
          },
        ]
      : []),
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: onDelete,
    },
  ];

  return (
    <AppDropdown
      aria-label={`Metadata item ${index + 1} actions`}
      as={HandleContainer}
      items={items}
    >
      <MoreMenu />
    </AppDropdown>
  );
}

function MetadataRow({
  index,
  isEditing,
  item,
  itemCount,
  onDelete,
  onEdit,
  onMoveToEnd,
  onMoveToStart,
  onSaveLabel,
  onSaveValue,
}: {
  index: number;
  isEditing: boolean;
  item: SortableMetadataItem;
  itemCount: number;
  onDelete: () => void;
  onEdit: () => void;
  onMoveToEnd: () => void;
  onMoveToStart: () => void;
  onSaveLabel: (label: InternationalString) => void;
  onSaveValue: (value: InternationalString) => void;
}) {
  const label = previewText(item.label);
  const value = previewText(item.value);
  const dragEnabled = itemCount > 1;
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { ref: item },
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = useMemo(
    () => ({
      opacity: isDragging ? 0.65 : 1,
      position: "relative" as const,
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [isDragging, transform, transition],
  );

  return (
    <fieldset
      aria-label={`Metadata item ${index + 1}`}
      className="mb-2 rounded border border-gray-200 bg-white p-0 shadow-sm focus-within:ring focus-within:ring-me-primary-500"
      ref={setNodeRef}
      style={style}
    >
      <div className="flex min-h-12 items-start gap-1.5 p-2">
        {dragEnabled ? (
          <HandleContainer
            aria-label={`Reorder metadata item ${index + 1}`}
            className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing"
            ref={setActivatorNodeRef}
            title="Reorder"
            {...attributes}
            {...listeners}
          >
            <ResizeHandleIcon />
          </HandleContainer>
        ) : null}
        <ButtonReset
          aria-expanded={isEditing}
          className="min-w-0 flex-1 text-left"
          onClick={() => {
            if (!isEditing) {
              onEdit();
            }
          }}
          type="button"
        >
          <span className="block whitespace-pre-wrap break-words text-sm font-semibold leading-5 text-[#333]">
            {label || (
              <span className="font-normal text-gray-500">Untitled label</span>
            )}
          </span>
          <span className="mt-0.5 block whitespace-pre-wrap break-words text-xs leading-5 text-gray-600">
            {value || <span className="text-gray-400">No value</span>}
          </span>
        </ButtonReset>
        <ButtonReset
          aria-label={
            isEditing
              ? `Done editing metadata item ${index + 1}`
              : `Edit metadata item ${index + 1}`
          }
          className="mt-0.5 flex aspect-square shrink-0 items-center rounded-sm p-1 text-xl hover:bg-me-primary-100"
          onClick={onEdit}
          title={isEditing ? "Done" : "Edit"}
          type="button"
        >
          {isEditing ? <TickIcon /> : <EditIcon />}
        </ButtonReset>
        <MetadataActionMenu
          index={index}
          itemCount={itemCount}
          onDelete={onDelete}
          onMoveToEnd={onMoveToEnd}
          onMoveToStart={onMoveToStart}
        />
      </div>
      {isEditing ? (
        <div className="border-t border-gray-200 px-2 pb-2 pt-3">
          <LanguageFieldEditor
            autoFocus
            disallowHTML
            fields={item.label || emptyLanguageMap}
            focusId={item.id}
            label="Label"
            onSave={(label: any) => onSaveLabel(label.toInternationalString())}
          />
          <LanguageFieldEditor
            disallowHTML
            fields={item.value || emptyLanguageMap}
            focusId={`${item.id}_value`}
            label="Value"
            onSave={(value: any) => onSaveValue(value.toInternationalString())}
          />
        </div>
      ) : null}
    </fieldset>
  );
}

export function Metadata() {
  const { descriptive } = useEditor();
  const [editingId, setEditingId] = useState<string>();
  const [pendingNewItemCount, setPendingNewItemCount] = useState<number>();
  const editingIndexRef = useRef<number>();
  const items = descriptive.metadata.getSortable() as SortableMetadataItem[];
  const itemCount = items.length;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (editingId && !items.some((item) => item.id === editingId)) {
      const fallbackItem =
        typeof editingIndexRef.current !== "undefined"
          ? items[editingIndexRef.current]
          : undefined;

      if (fallbackItem) {
        setEditingId(fallbackItem.id);
      } else {
        editingIndexRef.current = undefined;
        setEditingId(undefined);
      }
    }
  }, [editingId, items]);

  useEffect(() => {
    if (
      typeof pendingNewItemCount !== "undefined" &&
      items.length > pendingNewItemCount
    ) {
      editingIndexRef.current = items.length - 1;
      setEditingId(items[items.length - 1]!.id);
      setPendingNewItemCount(undefined);
    }
  }, [items, pendingNewItemCount]);

  const findItemById = useCallback(
    (id: string) => {
      const currentItems =
        descriptive.metadata.getSortable() as SortableMetadataItem[];
      const index = currentItems.findIndex((item) => item.id === id);

      return {
        index,
        item: currentItems[index],
      };
    },
    [descriptive.metadata],
  );

  const saveLabel = useCallback(
    (id: string, label: InternationalString) => {
      const { index, item } = findItemById(id);

      if (item) {
        descriptive.metadata.update(index, label, item.value);
      }
    },
    [descriptive.metadata, findItemById],
  );

  const saveValue = useCallback(
    (id: string, value: InternationalString) => {
      const { index, item } = findItemById(id);

      if (item) {
        descriptive.metadata.update(index, item.label, value);
      }
    },
    [descriptive.metadata, findItemById],
  );

  const deleteItem = useCallback(
    (id: string) => {
      const { index } = findItemById(id);

      if (index !== -1) {
        descriptive.metadata.deleteAtIndex(index);
      }

      if (editingId === id) {
        setEditingId(undefined);
      }
    },
    [descriptive.metadata, editingId, findItemById],
  );

  const moveToStart = useCallback(
    (id: string) => {
      const { index } = findItemById(id);

      if (index !== -1) {
        descriptive.metadata.moveToStart(index);
      }
    },
    [descriptive.metadata, findItemById],
  );

  const moveToEnd = useCallback(
    (id: string) => {
      const { index } = findItemById(id);

      if (index !== -1) {
        descriptive.metadata.moveToEnd(index);
      }
    },
    [descriptive.metadata, findItemById],
  );

  const onDragEnd = useCallback(
    (result: DragEndEvent) => {
      const { active, over } = result;

      if (!over || active.id === over.id) {
        return;
      }

      const startIndex = items.findIndex((item) => item.id === active.id);
      const endIndex = items.findIndex((item) => item.id === over.id);

      if (startIndex !== -1 && endIndex !== -1) {
        descriptive.metadata.reorder(startIndex, endIndex);
      }
    },
    [descriptive.metadata, items],
  );

  return (
    <PaddedSidebarContainer>
      <DndContext
        collisionDetection={closestCenter}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        modifiers={[restrictToParentElement]}
        onDragEnd={onDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, index) => (
            <MetadataRow
              index={index}
              isEditing={editingId === item.id}
              item={item}
              itemCount={itemCount}
              key={item.id}
              onDelete={() => deleteItem(item.id)}
              onEdit={() => {
                editingIndexRef.current =
                  editingId === item.id ? undefined : index;
                setEditingId((current) =>
                  current === item.id ? undefined : item.id,
                );
              }}
              onMoveToEnd={() => moveToEnd(item.id)}
              onMoveToStart={() => moveToStart(item.id)}
              onSaveLabel={(label) => saveLabel(item.id, label)}
              onSaveValue={(value) => saveValue(item.id, value)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {itemCount === 0 && (
        <EmptyState $noMargin $box>
          No metadata items
        </EmptyState>
      )}

      <ActionButton
        className="sticky bottom-0 mt-2"
        onPress={() => {
          setPendingNewItemCount(itemCount);
          descriptive.metadata.add({ en: [""] }, { en: [""] });
        }}
      >
        <AddIcon />
        Add metadata item
      </ActionButton>
    </PaddedSidebarContainer>
  );
}
