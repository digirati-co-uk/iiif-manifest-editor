import { useResourceContext } from "react-iiif-vault";
import { ManifestNormalized } from "@iiif/presentation-3";
import { useVaultSelector } from "react-iiif-vault";
import { useMemo } from "react";
import { IIIFStore } from "@iiif/vault";

// NB... This hook will be switched out when https://github.com/digirati-co-uk/react-iiif-vault/pull/1 is merged

export function useManifest(options?: {
  id: string;
}): ManifestNormalized | undefined;

export function useManifest<T>(
  options?: { id: string; selector: (manifest: ManifestNormalized) => T },
  deps?: any[]
): T | undefined;

export function useManifest<T = ManifestNormalized>(
  options: {
    id?: string;
    selector?: (manifest: ManifestNormalized) => T;
  } = {},
  deps: any[] = []
): ManifestNormalized | T | undefined {
  const { id, selector } = options;
  const ctx = useResourceContext();
  const manifestId = id ? id : ctx.manifest;

  const manifest = useVaultSelector((s: IIIFStore) =>
    manifestId ? s.iiif.entities.Manifest[manifestId] : undefined
  );

  return useMemo(() => {
    if (!manifest) {
      return undefined;
    }
    if (selector) {
      return selector(manifest);
    }
    return manifest;
  }, [manifest, selector, ...deps]);
}
