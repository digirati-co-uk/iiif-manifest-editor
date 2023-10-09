import * as $ from "./styles/HoverCard.styles";
import { CollectionListing } from "./components/CollectionListing";
import { Vault } from "@iiif/vault";
import { VaultProvider } from "react-iiif-vault";
import { ExplorerStoreProvider } from "./IIIFExplorer.store";
import { ExplorerEntry } from "./components/ExplorerEntry";
import { ManifestListing } from "./components/ManifestListing";
import { CanvasView } from "./components/CanvasView";
import filter from "./icons/filter.svg";
import expand from "./icons/expand.svg";
import { useState } from "react";
import { FilterProvider, ItemFilter } from "./components/ItemFilter";
import { ExplorerOutput } from "./components/ExplorerOutput";
import { OutputFormat, OutputTarget, OutputType, HistoryItem } from "./IIIFExplorer.types";
import { CanvasRegionView } from "@/components/widgets/IIIFExplorer/components/CanvasRegionView";
import { BoxStyle } from "@atlas-viewer/atlas";
import "./IIIFExplorer.css";

export interface IIIFExplorerProps {
  /**
   * @default {{ type: "text" }}
   */
  entry?:
    | { type: "Collection"; id: string }
    | { type: "Manifest"; id: string }
    | { type: "Text"; onlyManifests?: boolean; onlyCollections?: boolean };

  entryHistory?: Array<HistoryItem>;

  /**
   * @default {{ type: "content-state" }}
   */
  output?: OutputFormat;

  /**
   * @default {['manifest', 'canvas', 'canvas-region']}
   */
  outputTypes?: Array<OutputType>;

  /**
   * @default {[ type: "clipboard" ]}
   */
  outputTargets?: OutputTarget[];

  allowRemoveEntry?: boolean;

  homepageCollection?: string;

  vault?: Vault;

  height?: number;

  hideHeader?: boolean;

  onSelect?: () => void;
  highlightStyle?: BoxStyle;
  window?: boolean;

  onBack?: () => void;
  hideBack?: boolean;
  clearHomepageCollection?: () => void;
  onHistory?: (id: string, type: string) => void;
  hideOutput?: boolean;
}

export function IIIFExplorer({
  output = { type: "content-state" },
  outputTargets = [{ type: "clipboard", label: "Copy JSON to clipboard", format: { type: "json" } }],
  outputTypes = ["Manifest", "Canvas", "CanvasRegion"],
  entry = { type: "Text" },
  vault,
  onHistory,
  hideHeader,
  allowRemoveEntry,
  homepageCollection,
  clearHomepageCollection,
  highlightStyle,
  height,
  onSelect,
  window,
  onBack,
  hideBack,
  hideOutput,
}: IIIFExplorerProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const canResetLast = allowRemoveEntry || entry?.type === "Text";

  return (
    <VaultProvider vault={vault || new Vault()}>
      <FilterProvider>
        <ExplorerStoreProvider
          entry={entry.type !== "Text" ? entry : undefined}
          options={{ canReset: canResetLast, onHistory }}
        >
          <div
            className={$.mainContainer}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setExpanded(false);
              }
            }}
          >
            <div className={$.hoverCardContainer} data-window={window} data-float={expanded} style={{ height }}>
              {hideHeader ? null : (
                <div className={$.hoverCardHeader}>
                  <div className={$.hoverCardLabel}>Select resource</div>
                  <div className={$.hoverCardAction} onClick={() => setIsFilterOpen((o) => !o)}>
                    <img src={filter} alt="Filter options" />
                  </div>
                  <div className={$.hoverCardAction} onClick={() => setExpanded((o) => !o)}>
                    <img src={expand} alt="Expand size" />
                  </div>
                </div>
              )}

              <ItemFilter open={isFilterOpen} />

              <ExplorerEntry
                entry={entry}
                homepageCollection={homepageCollection}
                clearHomepageCollection={clearHomepageCollection}
                canReset={canResetLast}
                hideBack={hideBack}
                onBack={onBack}
              />

              {/* Only shown if we are looking at a collection */}
              <CollectionListing />

              {/* Only shown if we are looking at a manifest */}
              <ManifestListing canvasMultiSelect={outputTypes?.includes("CanvasList")} />

              <CanvasView
                highlightStyle={highlightStyle}
                regionEnabled={!hideOutput && outputTypes?.includes("CanvasRegion")}
              />

              <CanvasRegionView />

              {hideOutput ? null : (
                <ExplorerOutput onSelect={onSelect} targets={outputTargets} types={outputTypes} format={output} />
              )}
            </div>
          </div>
        </ExplorerStoreProvider>
      </FilterProvider>
    </VaultProvider>
  );
}
