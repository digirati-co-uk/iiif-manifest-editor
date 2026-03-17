import type {
  ManifestEditorToolDefinition,
  ManifestEditorToolPublicDefinition,
  ManifestEditorToolResult,
  ManifestEditorToolRuntime,
} from "../types";
import { createFailure, toolError } from "./helpers";
import { buildCoreToolRegistry } from "../tools/core";
import { buildManifestToolRegistry } from "../tools/manifest";
import { buildExhibitionToolRegistry } from "../tools/exhibition";

export function buildToolRegistry(runtime: ManifestEditorToolRuntime): ManifestEditorToolDefinition[] {
  const registry = [
    ...buildCoreToolRegistry(),
    ...buildManifestToolRegistry(),
  ];

  if (runtime.mode === "exhibition") {
    registry.push(...buildExhibitionToolRegistry());
  }

  return registry;
}

export function getToolDefinitions(
  registry: ManifestEditorToolDefinition[],
): ManifestEditorToolPublicDefinition[] {
  return registry.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
}

export async function invokeTool(
  runtime: ManifestEditorToolRuntime,
  toolName: string,
  input: unknown,
): Promise<ManifestEditorToolResult> {
  const registry = runtime.registry.length ? runtime.registry : buildToolRegistry(runtime);
  const tool = registry.find((definition) => definition.name === toolName);

  if (!tool) {
    return createFailure(toolName, toolError("NOT_FOUND", `Tool ${toolName} was not found`));
  }

  try {
    const result = await tool.execute(runtime, input);

    if (result.ok && (result.changedRefs.length || result.createdRefs.length)) {
      runtime.onChange?.({
        toolName,
        input,
        result,
      });
    }

    return result;
  } catch (error) {
    return createFailure(toolName, error);
  }
}
