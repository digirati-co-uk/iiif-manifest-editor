/** Serialisable UI metadata, structurally compatible with the public i18n MessageReference.
 * Kept explicit so the data API has no React/runtime or private authoring dependency.
 * Never use this contract to replace authored IIIF InternationalString values.
 */
export interface DisplayMessageReference {
  readonly namespace: string;
  readonly key: string;
  readonly values?: Readonly<Record<string, string | number | boolean | null>>;
  readonly defaultValue?: string;
}

export interface DisplayLabel {
  label: string;
  labelMessage?: DisplayMessageReference;
}
