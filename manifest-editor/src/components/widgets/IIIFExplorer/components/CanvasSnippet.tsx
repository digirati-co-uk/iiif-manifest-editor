import * as $ from "@/components/widgets/IIIFExplorer/styles/ManifestListing.styles";
import { LocaleString } from "@/atoms/LocaleString";
import { useCanvas, useManifest, useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { LazyCanvasThumbnail } from "@/components/widgets/IIIFExplorer/components/LazyCanvasThumbnail";
import React from "react";
import { contentStateFormat } from "@/components/widgets/IIIFExplorer/formats/content-state";

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

  invariant(canvas);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectEnabled && (e.metaKey || e.shiftKey)) {
      if (selected) {
        onDeselect();
      } else {
        onSelect(e.shiftKey);
      }
      return;
    }

    try {
      const outerContainer = (e.currentTarget as HTMLDivElement).parentElement!.parentElement!.parentElement!
        .parentElement as HTMLDivElement;
      const container = (e.currentTarget as HTMLDivElement).parentElement!.parentElement!
        .parentElement as HTMLDivElement;
      const thumb = e.currentTarget as HTMLDivElement;
      const rect = thumb.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const oRect = outerContainer.getBoundingClientRect();
      // Try to position absolute.
      const cloned = thumb as HTMLDivElement;
      cloned.style.position = "absolute";
      cloned.style.top = `${rect.top - cRect.top}px`;
      cloned.style.left = `${rect.left - cRect.left}px`;
      cloned.style.transform = `translate(0, 0)`;
      cloned.style.width = `${rect.width}px`;
      cloned.style.height = `${rect.height}px`;
      cloned.style.transition = "all 300ms";
      cloned.style.maxHeight = "100%";

      // container.append(cloned);
      outerContainer.style.pointerEvents = "none";

      requestAnimationFrame(() => {
        cloned.style.transform = `translate(${-(rect.left - cRect.left)}px, ${-(
          rect.top -
          cRect.top -
          outerContainer.scrollTop
        )}px)`;
        cloned.style.width = `${oRect.width}px`;
        cloned.style.height = `${oRect.height}px`;
      });

      setTimeout(() => {
        _onClick();
        // container.removeChild(cloned);
      }, 300);
    } catch (e) {
      _onClick();
    }
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
      <div className={$.ThumbnailImage} onClick={onClick}>
        <LazyCanvasThumbnail />
      </div>
      <div className={$.ThumbnailLabel}>
        <LocaleString>{canvas.label}</LocaleString>
      </div>
    </div>
  );
}
