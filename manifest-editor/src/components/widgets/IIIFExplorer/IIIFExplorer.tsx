import * as $ from "@/components/widgets/IIIFExplorer/styles/HoverCard.styles";
import { CollectionListing } from "@/components/widgets/IIIFExplorer/components/CollectionListing";
import { ResourceActionBar } from "@/components/widgets/IIIFExplorer/components/ResourceActionBar";
import { Vault } from "@iiif/vault";
import { VaultProvider } from "react-iiif-vault";
import { ExplorerStoreProvider } from "@/components/widgets/IIIFExplorer/IIIFExplorer.store";
import { ExplorerEntry } from "@/components/widgets/IIIFExplorer/components/ExplorerEntry";
import { ManifestListing } from "./components/ManifestListing";
import { CanvasView } from "@/components/widgets/IIIFExplorer/components/CanvasView";
import filter from "./icons/filter.svg";
import { useState } from "react";
import { FilterProvider, ItemFilter } from "@/components/widgets/IIIFExplorer/components/ItemFilter";

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
  output?: { type: "content-state" } | { type: "json" } | { type: "url" };

  /**
   * @default {['manifest', 'canvas', 'canvas-region']}
   */
  outputTypes?: Array<"Collection" | "Manifest" | "Canvas" | "ImageService" | "CanvasRegion">;

  /**
   * @default {[ type: "clipboard" ]}
   */
  outputTargets?: Array<
    | { type: "callback"; label?: string; cb: (resource: any) => void }
    | { type: "clipboard"; label?: string }
    | { type: "input"; label?: string; el: HTMLInputElement }
  >;

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

              <ResourceActionBar />
            </div>
          </div>
        </ExplorerStoreProvider>
      </FilterProvider>
    </VaultProvider>
  );
}
