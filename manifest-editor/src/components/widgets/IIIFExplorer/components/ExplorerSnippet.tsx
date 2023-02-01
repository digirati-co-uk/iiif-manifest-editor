import { CollectionNormalized, ManifestNormalized, Reference } from "@iiif/presentation-3";
import * as $ from "@/components/widgets/IIIFExplorer/styles/CollectionListing.styles";
import folder from "@/components/widgets/IIIFExplorer/icons/folder.svg";
import { ManifestContext, useExternalResource, useThumbnail, useVault, useVaultSelector } from "react-iiif-vault";
import { LocaleString } from "@/atoms/LocaleString";
import { useAccessibleClick } from "@/hooks/useAccessibleClick";
import { isVisible } from "@/helpers/is-visible";
import { useEffect, useRef, useState } from "react";
import { ManifestIcon } from "@/components/widgets/IIIFExplorer/components/ManifestIcon";
import { LazyLoadComponent } from "react-lazy-load-image-component";

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

  return (
    <div
      ref={ref}
      className={$.collectionItem}
      data-active={props.active}
      tabIndex={0}
      data-collection-list-index={props.index}
      {...accessible}
    >
      <div className={$.collectionIcon}>
        {resource.type === "Manifest" ? (
          <ManifestContext manifest={resource.id}>
            <LazyLoadComponent>
              <LoadManifestComponent resource={resource} />
              <ManifestIcon />
            </LazyLoadComponent>
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
    if (resource?.type === "Manifest") {
      vault.load(resource?.id);
    }
  }, []);

  return null;
}
