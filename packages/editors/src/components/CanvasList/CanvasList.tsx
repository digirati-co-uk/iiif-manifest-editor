import { isSpecificResource, toRef } from "@iiif/parser";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import { getValue } from "@iiif/helpers";
import type { ReactNode } from "react";
import { CanvasContext, useVault } from "react-iiif-vault";
import type { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { CanvasListPreview } from "../CanvasListPreview/CanvasListPreview";
import { ReorderList } from "../ReorderList/ReorderList.dndkit";

interface CanvasListProps {
  id?: string;
  list: Array<Reference | ({ id: string } & SpecificResource)>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  activeId?: string;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
  inlineActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
}

export function CanvasList(props: CanvasListProps) {
  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-canvas-list"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        renderItem={(item, index) => {
          const ref = toRef(item) as Reference;
          return ref.type === "Canvas" ? (
            <CanvasContext canvas={ref.id}>
              <CanvasListPreview
                key={item.id}
                editing
                active={props?.activeId === ref.id}
                onClick={() => props.onSelect(item, index)}
              />
            </CanvasContext>
          ) : (
            <ManifestItemListPreview
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
    <div id={props.id}>
      {props.list.map((item, idx) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return ref.type === "Canvas" ? (
          <CanvasContext canvas={ref.id} key={ref.id}>
            <CanvasListPreview
              margin
              key={item.id}
              active={props?.activeId === ref.id}
              onClick={() => props.onSelect(ref, idx)}
            />
          </CanvasContext>
        ) : (
          <ManifestItemListPreview
            key={ref.id}
            item={ref}
            active={props?.activeId === ref.id}
            onClick={() => props.onSelect(ref, idx)}
          />
        );
      })}
    </div>
  );
}

function ManifestItemListPreview({
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
      className={[
        "flex w-full cursor-pointer items-center gap-2 border-b border-gray-200 bg-white p-1.5 text-left hover:bg-gray-50",
        active ? "border-[#892c4e] bg-gray-50 text-black" : "",
      ].join(" ")}
      data-canvas-selected={active}
      onClick={onClick}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg text-gray-400" aria-hidden>
        {item.type === "Scene" ? "◫" : "↔"}
      </span>
      <span className="min-w-0 flex-1 truncate">
        {getValue(resource?.label) || `Untitled ${item.type.toLowerCase()}`}
      </span>
      <span className="text-xs text-gray-400">{item.type}</span>
    </button>
  );
}
