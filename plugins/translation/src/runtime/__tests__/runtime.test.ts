import { afterEach, describe, expect, test, vi } from "vitest";

const pipeline = vi.fn();

vi.mock("@huggingface/transformers", () => ({
  env: {},
  pipeline,
}));

describe("translation worker runtime", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    pipeline.mockReset();
  });

  test("falls back from WebGPU to WASM when WebGPU loading fails", async () => {
    vi.stubGlobal("navigator", { gpu: {} });
    const translator = vi.fn(async () => [{ translation_text: "Привіт" }]);
    pipeline.mockImplementation(async (_task, _model, options) => {
      if (options.device === "webgpu") {
        throw new Error("No WebGPU adapter");
      }
      return translator;
    });
    const { TranslationWorkerRuntime } = await import("../worker/runtime");
    const runtime = new TranslationWorkerRuntime();
    const events: unknown[] = [];

    await runtime.preload("auto", (event) => events.push(event));
    const result = await runtime.translate(
      "request-1",
      {
        text: "Hello",
        sourceLanguage: "en",
        targetLanguage: "nl",
        runtime: "auto",
      },
      (event) => events.push(event),
    );

    expect(pipeline).toHaveBeenCalledTimes(2);
    expect(pipeline.mock.calls[0]?.[2]).toMatchObject({ device: "webgpu", dtype: "q4" });
    expect(pipeline.mock.calls[1]?.[2]).toMatchObject({ dtype: "q4" });
    expect(pipeline.mock.calls[1]?.[2]).not.toHaveProperty("device");
    expect(events).toContainEqual({
      type: "runtime-fallback",
      from: "webgpu",
      to: "wasm",
      message: "No WebGPU adapter",
    });
    expect(result).toMatchObject({
      text: "Привіт",
      sourceLanguage: "en",
      targetLanguage: "nl",
      runtime: "wasm",
    });
  });
});
