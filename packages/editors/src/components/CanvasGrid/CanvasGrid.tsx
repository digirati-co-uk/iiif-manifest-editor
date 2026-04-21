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
import { type ReactNode, useMemo, useState, useEffect } from "react";

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
  inlineActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
  thumbnailIcon?: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
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
        renderItem={(item, index) => {
          const ref = toRef(item) as Reference;

          return (
            <CanvasContext canvas={ref?.id as string}>
              <CanvasThumbnailGridItem
                key={item.id}
                active={props?.activeId === ref?.id}
                onClick={() => props.onSelect(item, index)}
                id={item.id}
                icon={ref ? props.thumbnailIcon?.(ref, index, item) : undefined}
              />
            </CanvasContext>
          );
        }}
        createActions={props.createActions}
        inlineActions={props.inlineActions}
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
              icon={props.thumbnailIcon?.(ref, idx, item)}
            />
          </CanvasContext>
        );
      })}
    </>
  );
}
