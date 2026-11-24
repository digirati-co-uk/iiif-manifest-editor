import type { InternationalString, MetadataItem } from "@iiif/presentation-3";
import { convertPresentation2 } from "@iiif/parser/presentation-2";

/**
 * Pure helpers behind the exhibition metadata sidebar:
 *  - inline "convert to required statement" hint (keyword driven)
 *  - metadata templates (editor config + `iiif:metadata-template` specification rules)
 *  - recovering metadata from the original source Manifest referenced by `partOf`
 */

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

type TextLike = InternationalString | string | null | undefined;

export function languageMapTexts(value: TextLike): string[] {
  if (!value) return [];
  if (typeof value === "string") return [value];
  const texts: string[] = [];
  for (const values of Object.values(value)) {
    for (const text of values || []) {
      if (typeof text === "string") texts.push(text);
    }
  }
  return texts;
}

/** Lower-cased, tag-stripped, punctuation-collapsed text for comparisons. */
export function normaliseMetadataText(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function hasText(value: TextLike): boolean {
  return languageMapTexts(value).some((text) => normaliseMetadataText(text).length > 0);
}

export function toLanguageMap(value: TextLike, language = "none"): InternationalString {
  if (!value) return { [language]: [""] };
  if (typeof value === "string") return { [language]: [value] };
  return value;
}

// ---------------------------------------------------------------------------
// Required statement conversion
// ---------------------------------------------------------------------------

export const DEFAULT_REQUIRED_STATEMENT_KEYWORDS = [
  "attribution",
  "credit",
  "credit line",
  "copyright",
  "copyright statement",
  "restrictions on use",
  "license",
  "licence",
  "rights holder",
  "rights statement",
  "acknowledgement",
  "acknowledgements",
  "acknowledgment",
  "acknowledgments",
  "required statement",
];

export interface RequiredStatementConversionConfig {
  /** Explicit `false` turns the hint off. */
  enabled?: boolean;
  /** Labels matching one of these (whole-word, case-insensitive) offer the conversion. */
  keywords?: string[];
}

export interface ResolvedRequiredStatementConversion {
  enabled: boolean;
  keywords: string[];
}

export function resolveRequiredStatementConversion(
  config?: RequiredStatementConversionConfig | null
): ResolvedRequiredStatementConversion {
  const keywords = Array.isArray(config?.keywords)
    ? config.keywords.map(normaliseMetadataText).filter(Boolean)
    : DEFAULT_REQUIRED_STATEMENT_KEYWORDS.map(normaliseMetadataText);
  return { enabled: config?.enabled !== false, keywords };
}

export function labelMatchesKeywords(label: TextLike, keywords: string[]): boolean {
  if (!keywords.length) return false;
  return languageMapTexts(label).some((text) => {
    const normalised = ` ${normaliseMetadataText(text)} `;
    return keywords.some((keyword) => keyword && normalised.includes(` ${keyword} `));
  });
}

export function canConvertToRequiredStatement(
  item: Pick<MetadataItem, "label" | "value"> | null | undefined,
  config?: RequiredStatementConversionConfig | null
): boolean {
  if (!item) return false;
  const resolved = resolveRequiredStatementConversion(config);
  if (!resolved.enabled) return false;
  return hasText(item.value) && labelMatchesKeywords(item.label, resolved.keywords);
}

export function metadataItemToRequiredStatement(item: Pick<MetadataItem, "label" | "value">) {
  return {
    label: JSON.parse(JSON.stringify(item.label || { none: [""] })) as InternationalString,
    value: JSON.parse(JSON.stringify(item.value || { none: [""] })) as InternationalString,
  };
}

// ---------------------------------------------------------------------------
// Comparing metadata items
// ---------------------------------------------------------------------------

function mapSignature(value: TextLike): string {
  const map = toLanguageMap(value);
  return JSON.stringify(
    Object.keys(map)
      .sort()
      .map((key) => [key, (map[key] || []).map((text) => text.trim())])
  );
}

export function metadataItemSignature(item: Pick<MetadataItem, "label" | "value">): string {
  return `${mapSignature(item.label)}|${mapSignature(item.value)}`;
}

export function isMetadataItemPresent(
  item: Pick<MetadataItem, "label" | "value">,
  current: Array<Pick<MetadataItem, "label" | "value">> | null | undefined
): boolean {
  const signature = metadataItemSignature(item);
  return (current || []).some((existing) => metadataItemSignature(existing) === signature);
}

function labelKeys(label: TextLike): string[] {
  return languageMapTexts(label).map(normaliseMetadataText).filter(Boolean);
}

export function hasMetadataLabel(
  label: TextLike,
  current: Array<Pick<MetadataItem, "label" | "value">> | null | undefined
): boolean {
  const wanted = labelKeys(label);
  if (!wanted.length) return false;
  return (current || []).some((existing) => labelKeys(existing.label).some((key) => wanted.includes(key)));
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface SpecificationLike {
  rules?: Array<{
    type: string;
    entityType?: string;
    items?: Array<{ label: TextLike; value?: TextLike }>;
  }>;
}

export function specificationMetadataTemplates(
  specifications: SpecificationLike[] | null | undefined,
  entityType: string,
  language = "none"
): MetadataItem[] {
  const templates: MetadataItem[] = [];
  for (const specification of specifications || []) {
    for (const rule of specification.rules || []) {
      if (rule.type !== "iiif:metadata-template") continue;
      if ((rule.entityType || "Manifest") !== entityType) continue;
      for (const item of rule.items || []) {
        if (!hasText(item.label)) continue;
        templates.push({
          label: toLanguageMap(item.label, language),
          value: item.value ? toLanguageMap(item.value, language) : { [language]: [""] },
        });
      }
    }
  }
  return templates;
}

/** Templates that are not already in `current` (matched by label), de-duplicated by label. */
export function getMissingMetadataTemplates(
  templates: Array<Pick<MetadataItem, "label" | "value">>,
  current: Array<Pick<MetadataItem, "label" | "value">> | null | undefined
): MetadataItem[] {
  const missing: MetadataItem[] = [];
  for (const template of templates) {
    if (!hasText(template.label)) continue;
    if (hasMetadataLabel(template.label, current)) continue;
    if (hasMetadataLabel(template.label, missing)) continue;
    missing.push({
      label: toLanguageMap(template.label),
      value: toLanguageMap(template.value),
    });
  }
  return missing;
}

// ---------------------------------------------------------------------------
// Source (partOf) metadata recovery
// ---------------------------------------------------------------------------

export interface SourceManifestRef {
  id: string;
  label?: InternationalString | null;
}

/** Candidate source manifest references (by id) in a (possibly truncated) `partOf` list. */
export function getSourceManifestRefs(partOf: unknown): SourceManifestRef[] {
  const refs: SourceManifestRef[] = [];
  for (const raw of Array.isArray(partOf) ? partOf : []) {
    const entry: any = raw?.type === "SpecificResource" ? raw.source : raw;
    const id = typeof entry === "string" ? entry : entry?.id || entry?.["@id"];
    const type = typeof entry === "string" ? undefined : entry?.originalType || entry?.type || entry?.["@type"];
    if (typeof id !== "string" || !/^https?:\/\//i.test(id)) continue;
    // The parser normalises Manifest partOf references to `ContentResource`, so the type is not
    // trustworthy: identify by id and validate the loaded resource instead. Only skip types that
    // can never be a source manifest.
    if (type && /^(canvas|range|annotation|annotationpage)$/i.test(String(type))) continue;
    if (refs.some((ref) => ref.id === id)) continue;
    refs.push({ id, label: typeof entry === "string" ? null : entry?.label || null });
  }
  return refs;
}

export interface SourceMetadataGroup {
  id: string;
  kind: "manifest" | "canvas";
  sourceId: string;
  label: InternationalString | null;
  items: MetadataItem[];
}

function cleanMetadata(metadata: unknown): MetadataItem[] {
  return (Array.isArray(metadata) ? metadata : []).filter(
    (item: any) => item && (hasText(item.label) || hasText(item.value))
  ) as MetadataItem[];
}

function stripFragment(id: string) {
  return id.split("#")[0]!;
}

/** Normalises a fetched source document (Presentation 2 or 3) to a Presentation 3 Manifest. */
export function toPresentation3Manifest(json: any): any {
  if (!json || typeof json !== "object") return null;
  const context = JSON.stringify(json["@context"] || "");
  const isV2 = context.includes("/presentation/2") || (!context.includes("/presentation/3") && "@id" in json);
  const converted = isV2 ? convertPresentation2(json) : json;
  // Validate what actually loaded: only a Manifest is a usable metadata source.
  return converted && typeof converted === "object" && converted.type === "Manifest" ? converted : null;
}

/**
 * Pulls the groups of source metadata that are relevant to `resource` out of an
 * original Manifest: always the manifest's own metadata, plus the matching
 * source canvas metadata when the editing resource is a Canvas that exists there.
 */
export function extractSourceMetadataGroups(
  sourceManifest: any,
  resource: { id: string; type: string }
): SourceMetadataGroup[] {
  const manifest = toPresentation3Manifest(sourceManifest);
  if (!manifest) return [];
  const groups: SourceMetadataGroup[] = [];
  const manifestId = manifest.id || "";

  const manifestItems = cleanMetadata(manifest.metadata);
  if (manifestItems.length) {
    groups.push({
      id: `manifest:${manifestId}`,
      kind: "manifest",
      sourceId: manifestId,
      label: manifest.label || null,
      items: manifestItems,
    });
  }

  if (resource.type === "Canvas") {
    const wanted = stripFragment(resource.id);
    const canvas = (manifest.items || []).find((item: any) => item?.id && stripFragment(item.id) === wanted);
    const canvasItems = cleanMetadata(canvas?.metadata);
    if (canvas && canvasItems.length) {
      groups.push({
        id: `canvas:${canvas.id}`,
        kind: "canvas",
        sourceId: canvas.id,
        label: canvas.label || null,
        items: canvasItems,
      });
    }
  }

  return groups;
}

export type FetchSourceManifest = (id: string, options: { signal?: AbortSignal }) => Promise<unknown>;

export const defaultFetchSourceManifest: FetchSourceManifest = async (id, { signal }) => {
  const response = await fetch(id, { signal, headers: { Accept: "application/ld+json, application/json" } });
  if (!response.ok) {
    throw new Error(`Unable to load the original manifest (${response.status})`);
  }
  return response.json();
};

const sourceManifestCache = new Map<string, Promise<unknown>>();

/** Loads (and caches) the full original manifest, never the truncated `partOf` reference. */
export function loadSourceManifest(
  id: string,
  options: { signal?: AbortSignal; fetchManifest?: FetchSourceManifest } = {}
): Promise<unknown> {
  const fetchManifest = options.fetchManifest || defaultFetchSourceManifest;
  const cacheable = !options.fetchManifest;
  const cached = cacheable ? sourceManifestCache.get(id) : undefined;
  if (cached) return cached;

  // Cached requests are shared between callers, so they are never tied to one caller's abort signal.
  const request = fetchManifest(id, { signal: cacheable ? undefined : options.signal });
  if (cacheable) {
    sourceManifestCache.set(id, request);
    // Never cache failures or aborted requests.
    request.catch(() => sourceManifestCache.delete(id));
  }
  return request;
}

export function clearSourceManifestCache() {
  sourceManifestCache.clear();
}

export interface SourceMetadataRow {
  item: MetadataItem;
  present: boolean;
}

export function describeSourceMetadata(
  group: SourceMetadataGroup,
  current: Array<Pick<MetadataItem, "label" | "value">> | null | undefined
): SourceMetadataRow[] {
  return group.items.map((item) => ({ item, present: isMetadataItemPresent(item, current) }));
}

/**
 * Flattens every source group into one list, keeping the first occurrence of each distinct
 * label/value pair so duplicates across groups (manifest + canvas) are only shown and counted once.
 */
export function describeUniqueSourceMetadata(
  groups: SourceMetadataGroup[],
  current: Array<Pick<MetadataItem, "label" | "value">> | null | undefined
): SourceMetadataRow[] {
  const seen = new Set<string>();
  const rows: SourceMetadataRow[] = [];
  for (const group of groups) {
    for (const row of describeSourceMetadata(group, current)) {
      const signature = metadataItemSignature(row.item);
      if (seen.has(signature)) continue;
      seen.add(signature);
      rows.push(row);
    }
  }
  return rows;
}
