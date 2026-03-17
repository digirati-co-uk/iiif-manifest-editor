import { createFailure, toolError } from "../runtime/helpers";
import { invokeTool } from "../runtime/registry";
import type { ManifestEditorToolDefinition, ManifestEditorToolRuntime } from "../types";

export interface OpenAIFunctionTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenAIToolCallLike {
  name?: string;
  arguments?: unknown;
  function?: {
    name?: string;
    arguments?: unknown;
  };
}

function parseOpenAIToolArguments(argumentsInput: unknown) {
  if (typeof argumentsInput === "undefined" || argumentsInput === null || argumentsInput === "") {
    return {};
  }

  if (typeof argumentsInput === "string") {
    try {
      return JSON.parse(argumentsInput);
    } catch (error) {
      throw toolError("INVALID_INPUT", "Tool arguments must be valid JSON", {
        arguments: argumentsInput,
        cause: error,
      });
    }
  }

  if (typeof argumentsInput === "object") {
    return argumentsInput;
  }

  throw toolError("INVALID_INPUT", "Tool arguments must be a JSON object or JSON string");
}

export function toOpenAITools(registry: ManifestEditorToolDefinition[]): OpenAIFunctionTool[] {
  return registry.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

export async function invokeOpenAIToolCall(
  runtime: ManifestEditorToolRuntime,
  toolCall: OpenAIToolCallLike,
) {
  const toolName = toolCall.function?.name || toolCall.name;

  if (!toolName) {
    return createFailure("unknown", toolError("INVALID_INPUT", "Tool call name is required"));
  }

  try {
    const input = parseOpenAIToolArguments(toolCall.function?.arguments ?? toolCall.arguments);
    return await invokeTool(runtime, toolName, input);
  } catch (error) {
    return createFailure(toolName, error);
  }
}
