import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { isSpecificResource, toRef } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { AnnotationPagePreview } from "../AnnotationPagePreview/AnnotationPagePreview";
import { AnnotationPageContext } from "react-iiif-vault";

interface AnnotationPageListProps {
  id?: string;
  list: Array<Reference | ({ id: string } & SpecificResource)>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
}

export function AnnotationPageList(props: AnnotationPageListProps) {
  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-anno-page-list"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        renderItem={(ref, index) => (
          <AnnotationPageContext annotationPage={toRef(ref)?.id as string} key={toRef(ref)?.id}>
            <AnnotationPagePreview key={ref.id} onClick={() => props.onSelect(ref, index)} />
          </AnnotationPageContext>
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
          <AnnotationPageContext annotationPage={ref.id} key={ref.id}>
            <AnnotationPagePreview margin key={item.id} onClick={() => props.onSelect(ref, idx)} />
          </AnnotationPageContext>
        );
      })}
    </div>
  );
}
