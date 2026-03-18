import type { Vault } from "@iiif/helpers/vault";
import { summariseResource } from "./utils";

interface ResourceRef {
  id: string;
  type: string;
}

interface LayoutSnapshot {
  leftPanelId: string | null;
  centerPanelId: string | null;
  rightPanelId: string | null;
  rightPanelTab: string | null;
}

export interface OpenRouterNavigationToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: any) => Promise<{
    ok: true;
    summary: string;
    warnings: string[];
    changedRefs: ResourceRef[];
    createdRefs: ResourceRef[];
    data: {
      resource: ReturnType<typeof summariseResource>;
      layout: LayoutSnapshot;
    };
  }>;
}

const resourceRefSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "type"],
  properties: {
    id: { type: "string" },
    type: { type: "string" },
  },
};

function resolveResource(vault: Vault, input: ResourceRef, expectedType: string) {
  if (!input?.id || !input?.type) {
    throw new Error("A resource reference with id and type is required");
  }

  const entity = vault.get(input as any, { skipSelfReturn: false } as any) as any;
  if (!entity) {
    throw new Error(`Resource ${input.id} was not found`);
  }

  if (entity.type !== expectedType) {
    throw new Error(`Expected a ${expectedType} but received ${entity.type}`);
  }

  return entity;
}

function createSuccessResult(options: {
  summary: string;
  resource: any;
  layout: LayoutSnapshot;
}) {
  return {
    ok: true as const,
    summary: options.summary,
    warnings: [],
    changedRefs: [{ id: options.resource.id, type: options.resource.type }],
    createdRefs: [],
    data: {
      resource: summariseResource(options.resource),
      layout: options.layout,
    },
  };
}

export function buildOpenRouterNavigationToolDefinitions(options: {
  vault: Vault;
  hasCanvasNavigation: boolean;
  hasRangeNavigation: boolean;
  currentLayout: LayoutSnapshot;
  focusCanvas: (resource: ResourceRef) => void;
  focusRange: (resource: ResourceRef) => void;
}): OpenRouterNavigationToolDefinition[] {
  const definitions: OpenRouterNavigationToolDefinition[] = [];

  if (options.hasCanvasNavigation) {
    definitions.push({
      name: "me_focus_canvas",
      description: "Open the canvas listing and current canvas panels, then focus the requested canvas in the editor.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["canvas"],
        properties: {
          canvas: resourceRefSchema,
        },
      },
      execute: async (input) => {
        const canvas = resolveResource(options.vault, input.canvas, "Canvas");
        options.focusCanvas({ id: canvas.id, type: canvas.type });
        return createSuccessResult({
          summary: `Focused canvas ${canvas.id}`,
          resource: canvas,
          layout: {
            ...options.currentLayout,
            leftPanelId: "canvas-listing",
            centerPanelId: "current-canvas",
          },
        });
      },
    });
  }

  if (options.hasRangeNavigation) {
    definitions.push({
      name: "me_focus_range",
      description: "Open the ranges listing and range workbench, then focus the requested range in the editor.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["range"],
        properties: {
          range: resourceRefSchema,
        },
      },
      execute: async (input) => {
        const range = resolveResource(options.vault, input.range, "Range");
        options.focusRange({ id: range.id, type: range.type });
        return createSuccessResult({
          summary: `Focused range ${range.id}`,
          resource: range,
          layout: {
            ...options.currentLayout,
            leftPanelId: "@manifest-editor/ranges-listing",
            centerPanelId: "range-workbench",
          },
        });
      },
    });
  }

  return definitions;
}
