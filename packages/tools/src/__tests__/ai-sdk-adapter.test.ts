import { describe, expect, it, vi } from "vitest";
import { toAiSdkTools } from "../adapters/ai-sdk";
import { createFixtureRuntime } from "./helpers";

const mocks = vi.hoisted(() => ({
  invokeTool: vi.fn(),
}));

vi.mock("../runtime/registry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../runtime/registry")>();

  return {
    ...actual,
    invokeTool: mocks.invokeTool,
  };
});

describe("ai sdk adapter", () => {
  it("exposes each runtime tool once", () => {
    const { runtime } = createFixtureRuntime();
    const tools = toAiSdkTools(runtime);
    const runtimeToolNames = runtime.registry.map((tool) => tool.name);

    expect(Object.keys(tools).sort()).toEqual([...runtimeToolNames].sort());
    expect(new Set(Object.keys(tools)).size).toBe(runtimeToolNames.length);
  });

  it("routes tool execution through invokeTool", async () => {
    const runtime = {
      registry: [
        {
          name: "demo_tool",
          description: "Demo tool",
          inputSchema: {
            type: "object",
            additionalProperties: false,
            properties: {},
          },
        },
      ],
    } as any;

    const expectedResult = {
      ok: true,
      toolName: "demo_tool",
      changedRefs: [],
      createdRefs: [],
      summary: "ok",
      warnings: [],
    };

    mocks.invokeTool.mockResolvedValueOnce(expectedResult);

    const tools = toAiSdkTools(runtime);
    const result = await tools.demo_tool.execute({ foo: "bar" });

    expect(mocks.invokeTool).toHaveBeenCalledTimes(1);
    expect(mocks.invokeTool).toHaveBeenCalledWith(runtime, "demo_tool", { foo: "bar" });
    expect(result).toEqual(expectedResult);
  });
});
