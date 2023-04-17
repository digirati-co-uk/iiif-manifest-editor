import { isSpecificResource } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { ContentResourcePreview } from "../ContentResourcePreview/ContentResourcePreview";
import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";

interface ContentResourceListProps {
  id?: string;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  list: Array<Reference | SpecificResource>;
  reorder?: (ctx: { startIndex: number; endIndex: number }) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
  inlineHandle?: boolean;
}

export function ContentResourceList(props: ContentResourceListProps) {
  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-list"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        renderItem={(ref, index) => (
          <ContentResourcePreview key={ref.id} id={ref.id} onClick={() => props.onSelect(ref, index)} />
        )}
        createActions={props.createActions}
      />
    );
  }

  return (
    <div id={props.id}>
      {props.list.map((item, idx) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return <ContentResourcePreview margin key={ref.id} id={ref.id} onClick={() => props.onSelect(item, idx)} />;
      })}
    </div>
  );
}
