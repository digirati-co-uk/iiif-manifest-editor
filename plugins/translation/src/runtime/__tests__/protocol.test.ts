import { describe, expect, test } from "vitest";
import {
  createDisposeRequest,
  createErrorResponse,
  createEventEnvelope,
  createPreloadRequest,
  createSuccessResponse,
  createTranslateRequest,
  createTranslationResultResponse,
} from "../protocol";

describe("translation worker protocol helpers", () => {
  test("creates request envelopes", () => {
    expect(createPreloadRequest("preload-1", { runtime: "auto" })).toEqual({
      kind: "request",
      command: "preload",
      requestId: "preload-1",
      payload: { runtime: "auto" },
    });

    expect(
      createTranslateRequest("translate-1", {
        text: "Hello",
        sourceLanguage: "en",
        targetLanguage: "nl",
        runtime: "wasm",
      }),
    ).toEqual({
      kind: "request",
      command: "translate",
      requestId: "translate-1",
      payload: {
        text: "Hello",
        sourceLanguage: "en",
        targetLanguage: "nl",
        runtime: "wasm",
      },
    });

    expect(createDisposeRequest("dispose-1")).toEqual({
      kind: "request",
      command: "dispose",
      requestId: "dispose-1",
    });
  });

  test("creates response and event envelopes", () => {
    expect(createSuccessResponse("preload", "preload-1", undefined)).toEqual({
      kind: "success",
      command: "preload",
      requestId: "preload-1",
      payload: undefined,
    });

    expect(
      createTranslationResultResponse("translate-1", {
        text: "Привіт",
        sourceLanguage: "en",
        targetLanguage: "nl",
        runtime: "wasm",
        durationMs: 12,
      }),
    ).toEqual({
      kind: "success",
      command: "translate",
      requestId: "translate-1",
      payload: {
        text: "Привіт",
        sourceLanguage: "en",
        targetLanguage: "nl",
        runtime: "wasm",
        durationMs: 12,
      },
    });

    expect(
      createErrorResponse("translate", "translate-1", {
        code: "translation_failed",
        message: "Model failed",
        recoverable: true,
      }),
    ).toEqual({
      kind: "error",
      command: "translate",
      requestId: "translate-1",
      payload: {
        code: "translation_failed",
        message: "Model failed",
        recoverable: true,
      },
    });

    expect(createEventEnvelope({ type: "model-ready", modelId: "Xenova/m2m100_418M", runtime: "wasm" })).toEqual({
      kind: "event",
      payload: { type: "model-ready", modelId: "Xenova/m2m100_418M", runtime: "wasm" },
    });
  });
});
