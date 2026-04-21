import type { TranslationRuntimePreference } from "../types";

export type { TranslationRuntimePreference } from "../types";

export type TranslationErrorCode =
  | "busy"
  | "invalid_request"
  | "model_load_failed"
  | "translation_failed"
  | "worker_failed";

export type TranslationRuntimeUsed = "webgpu" | "wasm";

export interface TranslationPreloadRequest {
  runtime: TranslationRuntimePreference;
}

export interface TranslationTextRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  runtime: TranslationRuntimePreference;
}

export interface TranslationTextResult {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  runtime: TranslationRuntimeUsed;
  durationMs: number;
}

export interface TranslationModelProgressEvent {
  type: "model-progress";
  progress: number;
  loaded: number;
  total: number;
  files: Record<string, { loaded: number; total: number }>;
}

export interface TranslationModelReadyEvent {
  type: "model-ready";
  modelId: string;
  runtime: TranslationRuntimeUsed;
}

export interface TranslationRuntimeFallbackEvent {
  type: "runtime-fallback";
  from: TranslationRuntimeUsed;
  to: TranslationRuntimeUsed;
  message: string;
}

export interface TranslationStartEvent {
  type: "translation-start";
  requestId: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationCompleteEvent {
  type: "translation-complete";
  requestId: string;
  result: TranslationTextResult;
}

export interface TranslationErrorEvent {
  type: "error";
  code: TranslationErrorCode;
  message: string;
  recoverable: boolean;
  requestId?: string;
}

export type TranslationEvent =
  | TranslationModelProgressEvent
  | TranslationModelReadyEvent
  | TranslationRuntimeFallbackEvent
  | TranslationStartEvent
  | TranslationCompleteEvent
  | TranslationErrorEvent;
