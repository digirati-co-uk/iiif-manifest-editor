import { getValue } from "@iiif/helpers";
import { isSpecificResource } from "@iiif/parser";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import cx from "classnames";
import { CollectionContext, ManifestContext, useCollection, useManifest } from "react-iiif-vault";
import type { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import {twMerge} from 'tailwind-merge';

import { CollectionListItem, ManifestListItem } from "@manifest-editor/components";

interface CollectionItemListProps {
  id?: string;
  list: Array<Reference | ({ id: string } & SpecificResource)>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  activeId?: string;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
}

export function ManifestItem(props: { margin?: boolean; active?: boolean; onClick?: () => void }) {
  const manifest = useManifest();

  return (
    <div className={twMerge(cx(
      "p-1.5 cursor-pointer flex gap-1.5 bg-white border-b border-gray-200 w-full hover:bg-gray-50",
      props.active && "bg-gray-50 text-black border-[#892c4e]",
    ))} aria-selected={props.active} onClick={props.onClick}>
      <div className="text-base text-ellipsis whitespace-nowrap overflow-hidden flex-1 min-w-0 text-start">
        {getValue(manifest?.label) || <span style={{ color: "#999" }}>Untitled manifest</span>}
      </div>
    </div>
  );
}

export function CollectionItem(props: { margin?: boolean; active?: boolean; onClick?: () => void }) {
  const collection = useCollection({} as any);

  return (
    <div className={twMerge(cx(
      "p-1.5 cursor-pointer flex gap-1.5 bg-white border-b border-gray-200 w-full hover:bg-gray-50",
      props.active && "bg-gray-50 text-black border-[#892c4e]",
      props.margin && "block"
    ))} aria-selected={props.active} onClick={props.onClick}>
      <div className="text-base text-ellipsis whitespace-nowrap overflow-hidden flex-1 min-w-0 text-start">
        {getValue(collection?.label) || <span style={{ color: "#999" }}>Untitled collection</span>}
      </div>
    </div>
  );
}
export function CollectionItemList(props: CollectionItemListProps) {
  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-collection-item-list"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        renderItem={(item, index) => {
          const ref = isSpecificResource(item) ? item.source : item;
          return ref.type === "Manifest" ? (
            <ManifestContext manifest={ref.id}>
              <ManifestListItem onAction={() => props.onSelect(ref, index)} isActive={props.activeId === ref.id} />
            </ManifestContext>
          ) : (
            <CollectionContext collection={ref.id}>
              <CollectionListItem onAction={() => props.onSelect(ref, index)} isActive={props.activeId === ref.id} />
            </CollectionContext>
          );
        }}
        createActions={props.createActions}
      />
    );
  }

  return (
    <ul aria-label="Collection items" id={props.id}>
      {props.list.map((item, index) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return ref.type === "Manifest" ? (
          <ManifestContext key={`${index}_${item.id}`} manifest={ref.id}>
            <ManifestListItem onAction={() => props.onSelect(ref, index)} isActive={props.activeId === ref.id} />
          </ManifestContext>
        ) : (
          <CollectionContext key={`${index}_${item.id}`} collection={ref.id}>
            <CollectionListItem onAction={() => props.onSelect(ref, index)} isActive={props.activeId === ref.id} />
          </CollectionContext>
        );
      })}
    </ul>
  );
}
