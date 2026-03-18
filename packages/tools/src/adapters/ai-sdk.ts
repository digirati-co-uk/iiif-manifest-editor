import { invokeTool } from "../runtime/registry";
import type { ManifestEditorToolJsonSchema, ManifestEditorToolRuntime, ToolModelExposure } from "../types";

export interface AiSdkTool<Input = unknown, Output = unknown> {
  description: string;
  inputSchema: ManifestEditorToolJsonSchema;
  execute: (input: Input) => Promise<Output>;
}

export type AiSdkToolSet = Record<string, AiSdkTool>;

export function toAiSdkTools(
  runtime: ManifestEditorToolRuntime,
  options: {
    exposure?: ToolModelExposure | "all";
  } = {},
): AiSdkToolSet {
  const tools: AiSdkToolSet = {};
  const exposure = options.exposure || "all";

  for (const definition of runtime.registry) {
    const modelExposure = definition.modelExposure || "default";
    if (exposure !== "all" && modelExposure !== exposure) {
      continue;
    }

    if (tools[definition.name]) {
      continue;
    }

    tools[definition.name] = {
      description: definition.description,
      inputSchema: definition.inputSchema,
      execute: async (input: unknown) => {
        return invokeTool(runtime, definition.name, input);
      },
    };
  }

  return tools;
}
