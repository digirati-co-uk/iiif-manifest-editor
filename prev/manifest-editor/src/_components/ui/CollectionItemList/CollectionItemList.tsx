import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { isSpecificResource } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { CollectionContext, ManifestContext, useCollection, useManifest } from "react-iiif-vault";
import { getValue } from "@iiif/helpers";
import cx from "classnames";
import { canvasListPreviewStyles as $ } from "@/_components/ui/CanvasListPreview/CanvasListPreview.styles";

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
    <div className={cx($.Item, props.margin && $.ItemMargin)} aria-selected={props.active} onClick={props.onClick}>
      <div className={$.Label}>
        {getValue(manifest?.label) || <span style={{ color: "#999" }}>Untitled manifest</span>}
      </div>
    </div>
  );
}

export function CollectionItem(props: { margin?: boolean; active?: boolean; onClick?: () => void }) {
  const collection = useCollection({} as any);

  return (
    <div className={cx($.Item, props.margin && $.ItemMargin)} aria-selected={props.active} onClick={props.onClick}>
      <div className={$.Label}>
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
              <ManifestItem onClick={() => props.onSelect(ref, index)} active={props.activeId === ref.id} />
            </ManifestContext>
          ) : (
            <CollectionContext collection={ref.id}>
              <CollectionItem onClick={() => props.onSelect(ref, index)} active={props.activeId === ref.id} />
            </CollectionContext>
          );
        }}
        createActions={props.createActions}
      />
    );
  }

  return (
    <div id={props.id}>
      {props.list.map((item, idx) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return ref.type === "Manifest" ? (
          <ManifestContext manifest={ref.id}>
            <ManifestItem />
          </ManifestContext>
        ) : (
          <CollectionContext collection={ref.id}>
            <CollectionItem />
          </CollectionContext>
        );
      })}
    </div>
  );
}
