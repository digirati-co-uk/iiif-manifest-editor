import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { isSpecificResource } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { AnnotationContext } from "react-iiif-vault";
import { AnnotationPreview } from "../AnnotationPreview/AnnotationPreview";
import { CanvasTargetContext } from "../CanvasTargetContext";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";

interface AnnotationListProps {
  id?: string;
  list: Array<Reference>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
}

export function AnnotationList(props: AnnotationListProps) {
  if (props.list.length === 0) {
    return (
      <>
        <EmptyState $noMargin $box>
          No annotations
        </EmptyState>
      </>
    );
  }

  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-annotation-list"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        renderItem={(item, index) => {
          const ref = isSpecificResource(item) ? item.source : item;
          return (
            <AnnotationContext annotation={ref.id} key={ref.id}>
              <CanvasTargetContext>
                <AnnotationPreview key={ref.id} onClick={() => props.onSelect(item, index)} />
              </CanvasTargetContext>
            </AnnotationContext>
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
        return (
          <AnnotationContext annotation={ref.id} key={ref.id}>
            <CanvasTargetContext>
              <AnnotationPreview margin key={ref.id} onClick={() => props.onSelect(ref, idx)} />
            </CanvasTargetContext>
          </AnnotationContext>
        );
      })}
    </div>
  );
}
