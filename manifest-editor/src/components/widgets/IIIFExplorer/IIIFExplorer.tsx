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

  vault?: Vault;

  height?: number;

  onSelect?: () => void;
  highlightStyle?: BoxStyle;
  window?: boolean;

  onBack?: () => void;
}

export function IIIFExplorer({
  output = { type: "content-state" },
  outputTargets = [{ type: "clipboard", label: "Copy JSON to clipboard", format: { type: "json" } }],
  outputTypes = ["Manifest", "Canvas", "CanvasRegion"],
  entry = { type: "Text" },
  vault,
  allowRemoveEntry,
  highlightStyle,
  height,
  onSelect,
  window,
  onBack,
}: IIIFExplorerProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const canResetLast = allowRemoveEntry || entry?.type === "Text";

  return (
    <VaultProvider vault={vault}>
      <FilterProvider>
        <ExplorerStoreProvider entry={entry.type !== "Text" ? entry : undefined} options={{ canReset: canResetLast }}>
          <div
            className={$.mainContainer}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setExpanded(false);
              }
            }}
          >
            <div className={$.hoverCardContainer} data-window={window} data-float={expanded} style={{ height }}>
              <div className={$.hoverCardHeader}>
                <div className={$.hoverCardLabel}>Select resource</div>
                <div className={$.hoverCardAction} onClick={() => setIsFilterOpen((o) => !o)}>
                  <img src={filter} alt="Filter options" />
                </div>
                <div className={$.hoverCardAction} onClick={() => setExpanded((o) => !o)}>
                  <img src={expand} alt="Expand size" />
                </div>
              </div>

              <ItemFilter open={isFilterOpen} />

              <ExplorerEntry entry={entry} canReset={canResetLast} onBack={onBack} />

              {/* Only shown if we are looking at a collection */}
              <CollectionListing />

              {/* Only shown if we are looking at a manifest */}
              <ManifestListing />

              <CanvasView highlightStyle={highlightStyle} regionEnabled={outputTypes?.includes("CanvasRegion")} />

              <CanvasRegionView />

              <ExplorerOutput onSelect={onSelect} targets={outputTargets} types={outputTypes} format={output} />
            </div>
          </div>
        </ExplorerStoreProvider>
      </FilterProvider>
    </VaultProvider>
  );
}
