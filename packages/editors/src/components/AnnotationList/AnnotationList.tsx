import { isSpecificResource } from "@iiif/parser";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import { EmptyState } from "@manifest-editor/components";
import { AnnotationContext, useAtlasStore } from "react-iiif-vault";
import { useStore } from "zustand";
import { AnnotationPreview } from "../AnnotationPreview/AnnotationPreview";
import type { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { CanvasTargetContext } from "../CanvasTargetContext";
import { ReorderList } from "../ReorderList/ReorderList.dndkit";

interface AnnotationListProps {
  id?: string;
  canvasId?: string;
  list: Array<Reference>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  isMedia?: boolean;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
}

export function AnnotationList(props: AnnotationListProps) {
  const store = useAtlasStore();
  const viewport = useStore(store, (s) => (props.canvasId ? s.canvasViewports[props.canvasId] : null));

  if (props.list.length === 0) {
    return (
      <EmptyState $noMargin $box>
        No {props.isMedia ? "media" : "annotations"}
      </EmptyState>
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
                <AnnotationPreview viewport={viewport} key={ref.id} onClick={() => props.onSelect(item, index)} />
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
              <AnnotationPreview viewport={viewport} margin key={ref.id} onClick={() => props.onSelect(ref, idx)} />
            </CanvasTargetContext>
          </AnnotationContext>
        );
      })}
    </div>
  );
}
