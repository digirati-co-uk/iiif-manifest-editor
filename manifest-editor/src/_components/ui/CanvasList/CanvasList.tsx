import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { isSpecificResource } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { CanvasListPreview } from "../CanvasListPreview/CanvasListPreview";
import { CanvasContext } from "react-iiif-vault";

interface CanvasListProps {
  id?: string;
  list: Array<Reference>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
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
        renderItem={(ref, index) => (
          <CanvasContext canvas={ref.id}>
            <CanvasListPreview key={ref.id} onClick={() => props.onSelect(ref, index)} />
          </CanvasContext>
        )}
        createActions={props.createActions}
      />
    );
  }

  return (
    <div id={props.id}>
      {props.list.map((item, idx) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return (
          <CanvasContext canvas={ref.id}>
            <CanvasListPreview margin key={ref.id} onClick={() => props.onSelect(ref, idx)} />
          </CanvasContext>
        );
      })}
    </div>
  );
}
