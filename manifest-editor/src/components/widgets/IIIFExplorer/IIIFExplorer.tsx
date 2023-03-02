import * as $ from "./styles/HoverCard.styles";
import { CollectionListing } from "./components/CollectionListing";
import { Vault } from "@iiif/vault";
import { VaultProvider } from "react-iiif-vault";
import { ExplorerStoreProvider } from "./IIIFExplorer.store";
import { ExplorerEntry } from "./components/ExplorerEntry";
import { ManifestListing } from "./components/ManifestListing";
import { CanvasView } from "./components/CanvasView";
import filter from "./icons/filter.svg";
import { useState } from "react";
import { FilterProvider, ItemFilter } from "./components/ItemFilter";
import { ExplorerOutput } from "./components/ExplorerOutput";
import { OutputFormat, OutputTarget, OutputType } from "./IIIFExplorer.types";

export interface IIIFExplorerProps {
  /**
   * @default {{ type: "text" }}
   */
  entry?:
    | { type: "Collection"; id: string }
    | { type: "Manifest"; id: string }
    | { type: "Text"; onlyManifests?: boolean; onlyCollections?: boolean };

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

  vault?: Vault;
}

export function IIIFExplorer({
  output = { type: "content-state" },
  outputTargets = [{ type: "clipboard" }],
  outputTypes = ["Manifest", "Canvas", "CanvasRegion"],
  entry = { type: "Text" },
  vault,
}: IIIFExplorerProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <VaultProvider vault={vault}>
      <FilterProvider>
        <ExplorerStoreProvider entry={entry.type !== "Text" ? entry : undefined}>
          <div className={$.mainContainer}>
            <div className={$.hoverCardContainer}>
              <div className={$.hoverCardHeader}>
                <div className={$.hoverCardLabel}>Select resource</div>
                <div className={$.hoverCardAction} onClick={() => setIsFilterOpen((o) => !o)}>
                  <img src={filter} alt="" />
                </div>
              </div>

              <ItemFilter open={isFilterOpen} />

              <ExplorerEntry entry={entry} />

              {/* Only shown if we are looking at a collection */}
              <CollectionListing />

              {/* Only shown if we are looking at a manifest */}
              <ManifestListing />

              <CanvasView />

              <ExplorerOutput targets={outputTargets} types={outputTypes} format={output} />
            </div>
          </div>
        </ExplorerStoreProvider>
      </FilterProvider>
    </VaultProvider>
  );
}
