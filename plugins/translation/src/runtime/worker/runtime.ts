import { env, pipeline } from "@huggingface/transformers";
import { TRANSLATION_CACHE_KEY, TRANSLATION_MODEL_ID } from "../../constants";
import type {
  TranslationErrorCode,
  TranslationEvent,
  TranslationRuntimePreference,
  TranslationRuntimeUsed,
  TranslationTextRequest,
  TranslationTextResult,
} from "../types";

type ProgressInfo = {
  status?: string;
  progress?: number;
  loaded?: number;
  total?: number;
  files?: Record<string, { loaded: number; total: number }>;
};

type RuntimeState = {
  translator: any;
  runtime: TranslationRuntimeUsed;
};

class TranslationRuntimeError extends Error {
  readonly code: TranslationErrorCode;
  readonly recoverable: boolean;

  constructor(code: TranslationErrorCode, message: string, recoverable: boolean) {
    super(message);
    this.code = code;
    this.recoverable = recoverable;
    this.name = code;
  }
}

function serializeUnknownError(
  error: unknown,
  fallbackCode: TranslationErrorCode,
  recoverable = false,
): TranslationRuntimeError {
  if (error instanceof TranslationRuntimeError) {
    return error;
  }

  if (error instanceof Error) {
    return new TranslationRuntimeError(fallbackCode, error.message, recoverable);
  }

  return new TranslationRuntimeError(fallbackCode, "The translation runtime failed unexpectedly.", recoverable);
}

export class TranslationWorkerRuntime {
  private runtimePromise: Promise<RuntimeState> | null = null;
  private runtimePreference: TranslationRuntimePreference | null = null;
  private activeRequestId: string | null = null;

  async preload(runtime: TranslationRuntimePreference, emit: (event: TranslationEvent) => void) {
    await this.getRuntime(runtime, emit);
  }

  async translate(
    requestId: string,
    request: TranslationTextRequest,
    emit: (event: TranslationEvent) => void,
  ): Promise<TranslationTextResult> {
    if (this.activeRequestId && this.activeRequestId !== requestId) {
      throw new TranslationRuntimeError("busy", "The translation worker is already processing another request.", true);
    }

    const text = request.text.trim();
    if (!text) {
      throw new TranslationRuntimeError("invalid_request", "Text is required for translation.", true);
    }

    this.activeRequestId = requestId;
    const startedAt = performance.now();

    try {
      const runtime = await this.getRuntime(request.runtime, emit);
      emit({
        type: "translation-start",
        requestId,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
      });

      const output = await runtime.translator(text, {
        src_lang: request.sourceLanguage,
        tgt_lang: request.targetLanguage,
      });
      const translationText = getTranslationText(output);
      const result = {
        text: translationText,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        runtime: runtime.runtime,
        durationMs: performance.now() - startedAt,
      };

      emit({
        type: "translation-complete",
        requestId,
        result,
      });

      return result;
    } catch (error) {
      const runtimeError = serializeUnknownError(error, "translation_failed");
      emit({
        type: "error",
        requestId,
        code: runtimeError.code,
        message: runtimeError.message,
        recoverable: runtimeError.recoverable,
      });
      throw runtimeError;
    } finally {
      this.activeRequestId = null;
    }
  }

  dispose() {
    this.runtimePromise = null;
    this.runtimePreference = null;
    this.activeRequestId = null;
  }

  private getRuntime(runtime: TranslationRuntimePreference, emit: (event: TranslationEvent) => void) {
    if (!this.runtimePromise || this.runtimePreference !== runtime) {
      this.runtimePreference = runtime;
      this.runtimePromise = this.loadRuntime(runtime, emit).catch((error) => {
        this.runtimePromise = null;
        this.runtimePreference = null;
        throw error;
      });
    }

    return this.runtimePromise;
  }

  private async loadRuntime(
    runtimePreference: TranslationRuntimePreference,
    emit: (event: TranslationEvent) => void,
  ): Promise<RuntimeState> {
    configureBrowserCache();

    const shouldTryWebGpu = runtimePreference !== "wasm" && typeof navigator !== "undefined" && "gpu" in navigator;
    if (shouldTryWebGpu) {
      try {
        return await this.createPipeline("webgpu", emit);
      } catch (error) {
        const message = error instanceof Error ? error.message : "WebGPU translation runtime failed to load.";
        emit({
          type: "runtime-fallback",
          from: "webgpu",
          to: "wasm",
          message,
        });
      }
    }

    try {
      return await this.createPipeline("wasm", emit);
    } catch (error) {
      throw serializeUnknownError(error, "model_load_failed");
    }
  }

  private async createPipeline(runtime: TranslationRuntimeUsed, emit: (event: TranslationEvent) => void): Promise<RuntimeState> {
    const translator = await pipeline(
      "translation",
      TRANSLATION_MODEL_ID,
      {
        dtype: "q4",
        ...(runtime === "webgpu" ? { device: "webgpu" } : {}),
        progress_callback: (info: ProgressInfo) => {
          if (info.status !== "progress_total") {
            return;
          }

          emit({
            type: "model-progress",
            progress: info.progress ?? 0,
            loaded: info.loaded ?? 0,
            total: info.total ?? 0,
            files: info.files ?? {},
          });
        },
      } as any,
    );

    emit({
      type: "model-ready",
      modelId: TRANSLATION_MODEL_ID,
      runtime,
    });

    return { translator, runtime };
  }
}

function configureBrowserCache() {
  if (typeof caches === "undefined") {
    return;
  }

  env.useBrowserCache = true;
  env.useWasmCache = true;
  env.cacheKey = TRANSLATION_CACHE_KEY;
}

function getTranslationText(output: unknown) {
  if (Array.isArray(output)) {
    const first = output[0] as { translation_text?: unknown } | undefined;
    if (typeof first?.translation_text === "string") {
      return first.translation_text;
    }
  }

  if (output && typeof output === "object" && typeof (output as any).translation_text === "string") {
    return (output as any).translation_text;
  }

  throw new TranslationRuntimeError("translation_failed", "The model did not return translation text.", true);
}
