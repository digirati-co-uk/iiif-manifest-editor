import * as $ from "@/components/widgets/IIIFExplorer/styles/ManifestListing.styles";
import { LocaleString } from "@/atoms/LocaleString";
import { useCanvas } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { LazyCanvasThumbnail } from "@/components/widgets/IIIFExplorer/components/LazyCanvasThumbnail";
import React from "react";

export function CanvasSnippet(props: { onClick: () => void }) {
  const canvas = useCanvas();

  invariant(canvas);

  const onClick = (e: React.MouseEvent) => {
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
        props.onClick();
        // container.removeChild(cloned);
      }, 300);
    } catch (e) {
      props.onClick();
    }
  };

  return (
    <div className={$.ThumbnailItem}>
      <div className={$.ThumbnailImage} onClick={onClick}>
        <LazyCanvasThumbnail />
      </div>
      <div className={$.ThumbnailLabel}>
        <LocaleString>{canvas.label}</LocaleString>
      </div>
    </div>
  );
}
