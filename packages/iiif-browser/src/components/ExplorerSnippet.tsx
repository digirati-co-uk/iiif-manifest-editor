import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import { Reference } from "@iiif/presentation-3";
import $ from "../styles/CollectionListing.module.css";
import { LocaleString, ManifestContext, useVault, useVaultSelector } from "react-iiif-vault";

import { useEffect, useRef } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { ErrorBoundary } from "react-error-boundary";
import { getValue } from "@iiif/helpers";
import { useAccessibleClick } from "../utils";
import { useFilter } from "./ItemFilter";
import { ManifestIcon } from "./ManifestIcon";
import { Spinner } from "@manifest-editor/ui/madoc/components/icons/Spinner";
import { FolderIcon } from "@manifest-editor/ui/icons/FolderIcon";

export interface ExplorerSnippetProps {
  resource: string | Reference;
  onClick: () => void;
  active?: boolean;

  index?: number;
}

export function ExplorerSnippet(props: ExplorerSnippetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const resource = useVaultSelector<CollectionNormalized | ManifestNormalized>((s, vault) => vault.get(props.resource));
  const resourceStatus = useVaultSelector((s, vault) =>
    vault.requestStatus(typeof props.resource === "string" ? props.resource : props.resource.id)
  );
  const accessible = useAccessibleClick(props.onClick);
  const { value: filterValue } = useFilter();

  if (filterValue && !getValue(resource.label).toLowerCase().includes(filterValue.toLowerCase())) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={$.collectionItem}
      data-active={props.active}
      tabIndex={0}
      data-collection-list-index={props.index}
      data-loading={resourceStatus?.loadingState}
      {...accessible}
    >
      <div className={$.collectionIcon}>
        {resourceStatus?.loadingState === "RESOURCE_LOADING" ? (
          <div style={{ position: "absolute", bottom: 10, right: 10 }}>
            <Spinner stroke="#000" />
          </div>
        ) : null}
        {resource.type === "Manifest" ? (
          <ManifestContext manifest={resource.id}>
            <ErrorBoundary fallback={null}>
              <LazyLoadComponent threshold={300}>
                <LoadManifestComponent resource={resource} />
                <ManifestIcon />
              </LazyLoadComponent>
            </ErrorBoundary>
          </ManifestContext>
        ) : (
          <FolderIcon />
        )}
      </div>
      <div className={$.collectionMeta}>
        <div className={$.collectionLabel}>
          <LocaleString>{resource?.label || { none: ["Untitled"] }}</LocaleString>
        </div>
        <div className={$.collectionType}>
          {resource?.type} {resourceStatus?.loadingState === "RESOURCE_LOADING" ? "loading" : ""}
        </div>
      </div>
    </div>
  );
}

function LoadManifestComponent({ resource }: { resource: Reference }) {
  const vault = useVault();
  useEffect(() => {
    try {
      if (resource?.type === "Manifest") {
        const full = vault.get<ManifestNormalized>(resource as any, { skipSelfReturn: false });
        if (full && (!full.thumbnail || full.thumbnail.length === 0)) {
          vault.loadManifest(resource?.id);
        }
      }
    } catch (e) {
      // ignore?
    }
  }, []);

  return null;
}
