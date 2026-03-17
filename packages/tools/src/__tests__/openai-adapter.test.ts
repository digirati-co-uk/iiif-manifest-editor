import { describe, expect, it } from "vitest";
import { invokeOpenAIToolCall, toOpenAITools } from "../adapters/openai";
import { createFixtureRuntime } from "./helpers";

describe("openai adapter", () => {
  it("serializes registry entries into OpenAI function tools", () => {
    const { runtime } = createFixtureRuntime();
    const tools = toOpenAITools(runtime.registry);

    expect(tools.some((tool) => tool.function.name === "me_get_root")).toBe(true);
    expect(tools.find((tool) => tool.function.name === "me_get_root")?.function.parameters).toEqual({
      type: "object",
      additionalProperties: false,
      properties: {},
    });
  });

  it("parses OpenAI-style tool calls and reports JSON errors", async () => {
    const { runtime, refs } = createFixtureRuntime();

    const success = await invokeOpenAIToolCall(runtime, {
      function: {
        name: "me_get_resource",
        arguments: JSON.stringify({
          resource: refs.canvas1,
        }),
      },
    });

    expect(success.ok).toBe(true);

    const failure = await invokeOpenAIToolCall(runtime, {
      function: {
        name: "me_get_resource",
        arguments: "{",
      },
    });

    expect(failure.ok).toBe(false);
    if (failure.ok) {
      return;
    }

    expect(failure.error.code).toBe("INVALID_INPUT");
  });
});
