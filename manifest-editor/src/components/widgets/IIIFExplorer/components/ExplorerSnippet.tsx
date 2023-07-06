import { CollectionNormalized, ManifestNormalized } from "@iiif/presentation-3-normalized";
import { Reference } from "@iiif/presentation-3";
import * as $ from "@/components/widgets/IIIFExplorer/styles/CollectionListing.styles";
import folder from "@/components/widgets/IIIFExplorer/icons/folder.svg";
import { ManifestContext, useVault, useVaultSelector } from "react-iiif-vault";
import { LocaleString } from "@/atoms/LocaleString";
import { useAccessibleClick } from "@/hooks/useAccessibleClick";
import { useEffect, useRef } from "react";
import { ManifestIcon } from "@/components/widgets/IIIFExplorer/components/ManifestIcon";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { ErrorBoundary } from "react-error-boundary";
import { Spinner } from "@/madoc/components/icons/Spinner";
import { useFilter } from "@/components/widgets/IIIFExplorer/components/ItemFilter";
import { getValue } from "@iiif/vault-helpers";
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
          <img src={folder} alt="" />
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
