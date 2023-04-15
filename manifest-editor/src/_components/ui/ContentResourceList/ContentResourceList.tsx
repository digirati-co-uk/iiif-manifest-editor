import { isSpecificResource } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { ContentResourcePreview } from "../ContentResourcePreview/ContentResourcePreview";

interface ContentResourceListProps {
  createAction?: { label: string; onClick: () => void };
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  list: Array<Reference | SpecificResource>;
}

export function ContentResourceList(props: ContentResourceListProps) {
  return (
    <div>
      {props.list.map((item, idx) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return <ContentResourcePreview key={ref.id} id={ref.id} onClick={() => props.onSelect(item, idx)} />;
      })}
    </div>
  );
}
