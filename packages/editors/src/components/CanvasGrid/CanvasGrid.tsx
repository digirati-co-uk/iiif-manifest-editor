import { ReorderList } from "../ReorderList/ReorderList.dndkit";
import { isSpecificResource, toRef } from "@iiif/parser";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";
import {
  CanvasContext,
  useCanvas,
  useRenderingStrategy,
  useVault,
} from "react-iiif-vault";
import { CanvasThumbnailGridItem } from "@manifest-editor/components";
import { createThumbnailHelper } from "@iiif/helpers";
import { useMemo, useState, useEffect } from "react";

interface CanvasGridProps {
  id?: string;
  list: Array<Reference | ({ id: string } & SpecificResource)>;
  reorder?: (result: { startIndex: number; endIndex: number }) => void;
  inlineHandle?: boolean;
  activeId?: string;
  onSelect: (item: Reference | SpecificResource, index: number) => void;
  createActions?: (
    ref: Reference,
    index: number,
    item: Reference | SpecificResource,
  ) => AppDropdownItem[];
}

export function CanvasGrid(props: CanvasGridProps) {
  if (props.reorder) {
    return (
      <ReorderList
        id={props.id || "reorder-canvas-grid"}
        marginBottom="0.5em"
        items={props.list || []}
        inlineHandle={props.inlineHandle}
        reorder={props.reorder}
        grid
        renderItem={(ref, index) => (
          <CanvasContext canvas={toRef(ref)?.id as string}>
            <CanvasThumbnailGridItem
              key={ref.id}
              active={props?.activeId === toRef(ref)?.id}
              onClick={() => props.onSelect(ref, index)}
              id={ref.id}
            />
          </CanvasContext>
        )}
        createActions={props.createActions}
      />
    );
  }

  return (
    <>
      {props.list.map((item, idx) => {
        const ref = isSpecificResource(item) ? item.source : item;
        return (
          <CanvasContext canvas={ref.id} key={ref.id}>
            <CanvasThumbnailGridItem
              id={item.id}
              key={item.id}
              selected={props?.activeId === ref.id}
              onClick={() => props.onSelect(ref, idx)}
            />
          </CanvasContext>
        );
      })}
    </>
  );
}
