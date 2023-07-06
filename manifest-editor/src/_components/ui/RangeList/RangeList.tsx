import { isSpecificResource } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { CanvasContext, RangeContext, useCanvas, useRange } from "react-iiif-vault";
import React from "react";
import { LocaleString } from "@/atoms/LocaleString";

interface RangeListProps {
  id?: string;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  list: Array<Reference>;
  reorder?: (ctx: { startIndex: number; endIndex: number }) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
  inlineHandle?: boolean;
}

function RangePreview(props: { id: string; onClick?: () => void; margin?: boolean }) {
  const range = useRange();
  const canvas = useCanvas();

  if (canvas) {
    return (
      <div onClick={props.onClick}>
        Canvas: <LocaleString>{canvas.label}</LocaleString>
      </div>
    );
  }

  if (range) {
    return (
      <div onClick={props.onClick}>
        Range: <LocaleString>{range?.label}</LocaleString>
      </div>
    );
  }

  return <div>Unknown Structure</div>;
}

export function RangeList(props: RangeListProps) {
  const renderItem = (item: Reference | SpecificResource, idx: number) => {
    const ref = isSpecificResource(item) ? item.source : item;

    if (ref.type === "Canvas") {
      return (
        <CanvasContext canvas={ref.id}>
          <RangePreview margin={!props.reorder} key={ref.id} id={ref.id} onClick={() => props.onSelect(item, idx)} />
        </CanvasContext>
      );
    }

    return (
      <RangeContext range={ref.id}>
        <RangePreview margin={!props.reorder} key={ref.id} id={ref.id} onClick={() => props.onSelect(item, idx)} />
      </RangeContext>
    );
  };

  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-list"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        renderItem={renderItem}
        createActions={props.createActions}
      />
    );
  }

  return <div id={props.id}>{props.list.map(renderItem)}</div>;
}
