import type { MetadataItem } from "@iiif/presentation-3";

/** Stored in config.creators['@manifest-editor/iiif-browser-creator']. */
export interface ManifestMetadataConfig {
  /** Unset imports all labels; an empty array imports none. */
  manifestMetadataLabels?: string[];
  /** Code-only: labels to extract into a required statement during import. */
  requiredStatementMetadataLabels?: string[];
}

const normalise = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .trim()
    .toLocaleLowerCase();

function matchesLabel(item: MetadataItem, labels: string[]) {
  const allowed = new Set(labels.map(normalise));
  return Object.values(item.label || {}).some((values) =>
    (values || []).some((value) => allowed.has(normalise(value)))
  );
}

/** Filter copies, preserving all language maps and leaving the source Manifest untouched. */
export function importManifestMetadata(
  manifest: { metadata?: MetadataItem[]; requiredStatement?: MetadataItem | null },
  config: ManifestMetadataConfig
) {
  const sourceMetadata = manifest.metadata || [];
  const hasStatement = Object.values(manifest.requiredStatement?.value || {}).some((values) =>
    (values || []).some((value) => normalise(value).length > 0)
  );
  // Extract before filtering so attribution need not also be in the import allowlist.
  const extracted =
    !hasStatement && config.requiredStatementMetadataLabels?.length
      ? sourceMetadata.find((item) => matchesLabel(item, config.requiredStatementMetadataLabels!))
      : undefined;
  const metadata = sourceMetadata.filter(
    (item) =>
      item !== extracted &&
      (config.manifestMetadataLabels === undefined || matchesLabel(item, config.manifestMetadataLabels))
  );

  return { metadata, requiredStatement: extracted || manifest.requiredStatement };
}
