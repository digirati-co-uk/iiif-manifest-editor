import * as $ from "@/components/widgets/IIIFExplorer/styles/ManifestListing.styles";
import { LocaleString } from "@/atoms/LocaleString";
import { useCanvas, useManifest, useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { LazyCanvasThumbnail } from "@/components/widgets/IIIFExplorer/components/LazyCanvasThumbnail";
import React, { useLayoutEffect, useRef } from "react";
import { contentStateFormat } from "@/components/widgets/IIIFExplorer/formats/content-state";
import { startViewTransition } from "@/helpers/start-view-transition";

export interface CanvasSnippetProps {
  onClick: () => void;
  onSelect: (shift: boolean) => void;
  onDeselect: () => void;
  selected?: boolean;
  selectEnabled?: boolean;
}

export function CanvasSnippet({
  onClick: _onClick,
  selected,
  onSelect,
  onDeselect,
  selectEnabled,
}: CanvasSnippetProps) {
  const vault = useVault();
  const manifest = useManifest();
  const canvas = useCanvas();
  const thumb = useRef<HTMLDivElement>(null);

  invariant(canvas);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const img = e.currentTarget.querySelector("img") as HTMLImageElement;
    if (img) {
      (img as any).style.viewTransitionName = "canvas-image";
    }

    if (selectEnabled && (e.metaKey || e.shiftKey)) {
      if (selected) {
        onDeselect();
      } else {
        onSelect(e.shiftKey);
      }
      return;
    }

    startViewTransition(() => _onClick());
  };

  return (
    <div
      className={$.ThumbnailItem}
      data-selected={selected}
      // onDragStart={(e) => {
      //   const cs = contentStateFormat.format(
      //     {
      //       id: canvas.id,
      //       type: "Canvas",
      //       parent: manifest,
      //     },
      //     { encoded: false, type: "content-state" },
      //     vault
      //   );
      //   cs.then((data: any) => {
      //     e.dataTransfer.setData("application/json", data);
      //   });
      // }}
    >
      <div ref={thumb} className={$.ThumbnailImage} onClick={onClick} style={{ viewTransitionName: canvas.id } as any}>
        <LazyCanvasThumbnail />
      </div>
      <div className={$.ThumbnailLabel}>
        <LocaleString>{canvas.label}</LocaleString>
      </div>
    </div>
  );
}
