import type { Vault } from "@iiif/helpers/vault";
import type { ToolMode } from "@manifest-editor/tools";
import type {
  ManifestEditorAiCanvasSummary,
  ManifestEditorAiContextSummary,
  ManifestEditorAiManifestSummary,
  ManifestEditorAiOutlineEntry,
  ManifestEditorAiRangePathEntry,
  ManifestEditorAiRangeSummary,
} from "./types";
import { safeJsonStringify, summariseResource } from "./utils";

const CANVAS_CONTEXT_LIMIT = 50;
const RANGE_CONTEXT_LIMIT = 25;

function getVaultEntity(
  vault: Vault,
  resource: { id?: string; type?: string } | null | undefined,
) {
  if (!resource?.id || !resource?.type) {
    return null;
  }

  return vault.get(resource as any, { skipSelfReturn: false } as any) as any;
}

function getResourceRef(vault: Vault, item: any): { id: string; type: string } | null {
  if (!item) {
    return null;
  }

  const source = item.source || item;
  const id = source?.id;
  if (!id) {
    return null;
  }

  const mapping = vault.getState().iiif.mapping || {};
  const type = source?.type || mapping[id];
  if (!type) {
    return null;
  }

  return { id, type };
}

function getResolvedEntity(vault: Vault, item: any) {
  const ref = getResourceRef(vault, item);
  return ref ? getVaultEntity(vault, ref) : null;
}

function getOutlineEntries(vault: Vault, items: any[], limit: number): [ManifestEditorAiOutlineEntry[], boolean] {
  const output: ManifestEditorAiOutlineEntry[] = [];

  for (let index = 0; index < items.length; index++) {
    if (index >= limit) {
      return [output, true];
    }

    const entity = getResolvedEntity(vault, items[index]);
    output.push({
      id: entity?.id || items[index]?.id || "",
      label: entity ? summariseResource(entity).label : null,
      index,
    });
  }

  return [output, false];
}

function buildManifestSummary(vault: Vault, manifest: any): ManifestEditorAiManifestSummary {
  const items = Array.isArray(manifest?.items) ? manifest.items : [];
  const structures = Array.isArray(manifest?.structures) ? manifest.structures : [];
  const [canvases, canvasesTruncated] = getOutlineEntries(vault, items, CANVAS_CONTEXT_LIMIT);
  const [topLevelRanges, topLevelRangesTruncated] = getOutlineEntries(vault, structures, RANGE_CONTEXT_LIMIT);

  return {
    id: manifest?.id || "",
    label: summariseResource(manifest).label,
    summary: summariseResource(manifest).summary,
    canvasCount: items.length,
    topLevelRangeCount: structures.length,
    canvases,
    canvasesTruncated,
    topLevelRanges,
    topLevelRangesTruncated,
  };
}

function buildCanvasSummary(vault: Vault, manifest: any, canvas: any): ManifestEditorAiCanvasSummary {
  const items = Array.isArray(manifest?.items) ? manifest.items : [];
  const index = items.findIndex((item: any) => {
    return getResourceRef(vault, item)?.id === canvas?.id;
  });

  return {
    ...summariseResource(canvas),
    index: index >= 0 ? index : null,
    totalCanvases: items.length || null,
    width: typeof canvas?.width === "number" ? canvas.width : undefined,
    height: typeof canvas?.height === "number" ? canvas.height : undefined,
    duration: typeof canvas?.duration === "number" ? canvas.duration : undefined,
  };
}

function countItemsOfType(vault: Vault, items: any[], type: string) {
  return items.reduce((total, item) => {
    return total + (getResourceRef(vault, item)?.type === type ? 1 : 0);
  }, 0);
}

function findRangePath(
  vault: Vault,
  ranges: any[],
  targetRangeId: string,
  path: ManifestEditorAiRangePathEntry[] = [],
): ManifestEditorAiRangePathEntry[] | null {
  for (const rangeRef of ranges) {
    const range = getResolvedEntity(vault, rangeRef);
    if (!range) {
      continue;
    }

    const nextPath = [...path, { id: range.id, label: summariseResource(range).label }];
    if (range.id === targetRangeId) {
      return nextPath;
    }

    const childRanges = (range.items || []).filter((item: any) => getResourceRef(vault, item)?.type === "Range");
    const match = findRangePath(vault, childRanges, targetRangeId, nextPath);
    if (match) {
      return match;
    }
  }

  return null;
}

function buildRangeSummary(vault: Vault, manifest: any, range: any): ManifestEditorAiRangeSummary {
  const items = Array.isArray(range?.items) ? range.items : [];
  return {
    ...summariseResource(range),
    path: findRangePath(vault, manifest?.structures || [], range?.id) || [],
    childRangeCount: countItemsOfType(vault, items, "Range"),
    canvasItemCount: countItemsOfType(vault, items, "Canvas"),
  };
}

export function buildManifestEditorAiContextSummary(options: {
  mode: ToolMode;
  vault: Vault;
  rootEntity: any;
  currentEntity: any | null;
  stackEntities: any[];
  activeCanvasEntity: any | null;
  activeRangeEntity: any | null;
  layout: {
    leftPanelId: string | null;
    centerPanelId: string | null;
    rightPanelId: string | null;
    rightPanelTab: string | null;
  };
  previewLink: string | null;
}): Omit<ManifestEditorAiContextSummary, "systemPrompt"> {
  const manifestSummary = buildManifestSummary(options.vault, options.rootEntity);

  return {
    mode: options.mode,
    manifest: manifestSummary,
    rootResource: summariseResource(options.rootEntity),
    currentSelection: options.currentEntity ? summariseResource(options.currentEntity) : null,
    stack: options.stackEntities.map((entity) => summariseResource(entity)),
    activeCanvas: options.activeCanvasEntity
      ? buildCanvasSummary(options.vault, options.rootEntity, options.activeCanvasEntity)
      : null,
    activeRange: options.activeRangeEntity
      ? buildRangeSummary(options.vault, options.rootEntity, options.activeRangeEntity)
      : null,
    layout: options.layout,
    previewLink: options.previewLink,
  };
}

export function buildManifestEditorSystemPrompt(summary: Omit<ManifestEditorAiContextSummary, "systemPrompt">) {
  return [
    "You are the built-in OpenRouter assistant for the IIIF Manifest Editor.",
    "Use the local IIIF Presentation 3 metadata in `packages/editor-api/src/meta/*` as the source of truth, not model memory.",
    "The manifest outline below is compact context, not full JSON. Use `me_get_root` or `me_get_resource` when you need the complete document or a full resource.",
    "Only curated default tools are exposed in this session. Generic fallback tools are intentionally hidden unless the product exposes them separately.",
    "Before every mutation, call `me_get_resource_capabilities` for the target resource and use its property guidance, property editor map, workflow hints, fallback notes, and anti-patterns.",
    "Prefer creator-backed workflows and existing editor tools over inventing raw IIIF structures manually.",
    "Use `data.normalizedInput` and named refs such as `primaryRef`, `canvas`, `annotationPage`, `topLevelRange`, and `initialChildRange` from tool results to drive follow-up calls.",
    "If a tool call fails, read the structured validation details and retry with corrected input instead of switching to a lower-level workflow.",
    "If the user explicitly asks for synthetic, placeholder, or test data, you may invent clearly marked sample content instead of refusing. For metadata testing, prefer labels and values that are obviously test data.",
    "If a target is unclear, use `me_get_root`, `me_search_resources`, `me_list_resources`, or `me_get_resource` before mutating anything.",
    "Use `me_focus_canvas` or `me_focus_range` when moving the visible editor state will help align with the user.",
    "Use `present_options` only when the user needs to choose between discrete options.",
    "After each tool-assisted edit, explain what changed using the tool summaries, named refs, and normalized input.",
    `Editor context:\n${safeJsonStringify(summary)}`,
  ].join("\n\n");
}
