import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { isSpecificResource, toRef } from "@iiif/parser";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import type { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { CanvasContext, useVault } from "react-iiif-vault";
import { CanvasThumbnailGridItem } from "@manifest-editor/components";
import { getValue } from "@iiif/helpers";
import type { ReactNode } from "react";

interface CanvasGridProps {
  id?: string;
  list: Array<Reference | ({ id: string } & SpecificResource)>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  activeId?: string;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (
    ref: Reference,
    index: number,
    item: Reference | SpecificResource,
  ) => AppDropdownItem[];
  inlineActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
  thumbnailIcon?: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
}

export function CanvasGrid(props: CanvasGridProps) {
  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-canvas-grid"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        grid
        renderItem={(item, index) => {
          const ref = toRef(item) as Reference;

          return ref.type === "Canvas" ? (
            <CanvasContext canvas={ref?.id as string}>
              <CanvasThumbnailGridItem
                key={item.id}
                active={props?.activeId === ref?.id}
                onClick={() => props.onSelect(item, index)}
                id={item.id}
                icon={ref ? props.thumbnailIcon?.(ref, index, item) : undefined}
              />
            </CanvasContext>
          ) : (
            <ManifestItemGridPreview
              key={ref.id}
              item={ref}
              active={props?.activeId === ref.id}
              onClick={() => props.onSelect(item, index)}
            />
          );
        }}
        createActions={props.createActions}
        inlineActions={props.inlineActions}
      />
    );
  }

  return (
    <>
      {props.list.map((item, idx) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return ref.type === "Canvas" ? (
          <CanvasContext canvas={ref.id} key={ref.id}>
            <CanvasThumbnailGridItem
              id={item.id}
              key={item.id}
              selected={props?.activeId === ref.id}
              onClick={() => props.onSelect(ref, idx)}
              icon={props.thumbnailIcon?.(ref, idx, item)}
            />
          </CanvasContext>
        ) : (
          <ManifestItemGridPreview
            key={ref.id}
            item={ref}
            active={props?.activeId === ref.id}
            onClick={() => props.onSelect(ref, idx)}
          />
        );
      })}
    </>
  );
}

function ManifestItemGridPreview({
  item,
  active,
  onClick,
}: {
  item: Reference;
  active: boolean;
  onClick: () => void;
}) {
  const vault = useVault();
  const resource = vault.get(item as any, { skipSelfReturn: false }) as any;

  return (
    <button
      type="button"
      className="flex min-w-0 flex-col text-left"
      data-canvas-selected={active}
      onClick={onClick}
    >
      <span
        className={[
          "flex aspect-square w-full items-center justify-center rounded border-2 bg-me-gray-100 p-4 text-center text-me-gray-600",
          active ? "border-me-primary-500" : "border-transparent",
        ].join(" ")}
      >
        <span>
          <span className="block text-4xl" aria-hidden>
            {item.type === "Scene" ? "◫" : "↔"}
          </span>
          <span className="mt-2 block text-sm font-semibold">{item.type}</span>
        </span>
      </span>
      <span className="mt-1 w-full truncate text-center text-sm">
        {getValue(resource?.label) || `Untitled ${item.type.toLowerCase()}`}
      </span>
    </button>
  );
}
