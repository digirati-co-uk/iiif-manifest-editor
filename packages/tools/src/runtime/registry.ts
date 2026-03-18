import type {
  ManifestEditorToolDefinition,
  ManifestEditorToolPublicDefinition,
  ManifestEditorToolResult,
  ManifestEditorToolRuntime,
} from "../types";
import { createFailure, toolError } from "./helpers";
import { createJsonSchemaValidator } from "./schema";
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
  options: {
    exposure?: "all" | "default" | "fallback";
  } = {},
): ManifestEditorToolPublicDefinition[] {
  const exposure = options.exposure || "all";
  return registry
    .filter((tool) => {
      const modelExposure = tool.modelExposure || "default";
      return exposure === "all" || modelExposure === exposure;
    })
    .map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      modelExposure: tool.modelExposure || "default",
    }));
}

function normaliseToolInput(tool: ManifestEditorToolDefinition, input: unknown) {
  const schema = tool.inputSchema as Record<string, unknown>;
  if (typeof input === "undefined" && schema?.type === "object") {
    return {};
  }

  return input;
}

function validateToolInput(tool: ManifestEditorToolDefinition, input: unknown) {
  const normalisedInput = normaliseToolInput(tool, input);
  const validate = createJsonSchemaValidator(tool.inputSchema);
  const issues = validate(normalisedInput);

  if (issues.length) {
    const firstIssue = issues[0]!;
    throw toolError(
      "INVALID_INPUT",
      `Invalid input for ${tool.name}: ${firstIssue.path} ${firstIssue.message.toLowerCase()}`,
      {
        issues,
        normalizedInput: normalisedInput,
        schemaFragment: firstIssue.schemaFragment,
      },
    );
  }

  return normalisedInput;
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
    const normalisedInput = validateToolInput(tool, input);
    const result = await tool.execute(runtime, normalisedInput);

    if (result.ok && (result.changedRefs.length || result.createdRefs.length)) {
      runtime.onChange?.({
        toolName,
        input: normalisedInput,
        result,
      });
    }

    return result;
  } catch (error) {
    return createFailure(toolName, error);
  }
}
