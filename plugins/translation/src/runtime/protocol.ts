import type {
  TranslationErrorCode,
  TranslationEvent,
  TranslationPreloadRequest,
  TranslationTextRequest,
  TranslationTextResult,
} from "./types";

export type TranslationWorkerCommand = "preload" | "translate" | "dispose";

export interface TranslationWorkerRequestBase {
  kind: "request";
  command: TranslationWorkerCommand;
  requestId: string;
}

export interface TranslationWorkerPreloadRequest extends TranslationWorkerRequestBase {
  command: "preload";
  payload: TranslationPreloadRequest;
}

export interface TranslationWorkerTranslateRequest extends TranslationWorkerRequestBase {
  command: "translate";
  payload: TranslationTextRequest;
}

export interface TranslationWorkerDisposeRequest extends TranslationWorkerRequestBase {
  command: "dispose";
}

export type TranslationWorkerRequest =
  | TranslationWorkerPreloadRequest
  | TranslationWorkerTranslateRequest
  | TranslationWorkerDisposeRequest;

export interface TranslationWorkerSuccessResponse<T = undefined> {
  kind: "success";
  requestId: string;
  command: TranslationWorkerCommand;
  payload: T;
}

export interface TranslationWorkerErrorPayload {
  code: TranslationErrorCode;
  message: string;
  recoverable: boolean;
}

export interface TranslationWorkerErrorResponse {
  kind: "error";
  requestId: string;
  command: TranslationWorkerCommand;
  payload: TranslationWorkerErrorPayload;
}

export interface TranslationWorkerEventEnvelope {
  kind: "event";
  payload: TranslationEvent;
}

export type TranslationWorkerResponse<T = undefined> =
  | TranslationWorkerSuccessResponse<T>
  | TranslationWorkerErrorResponse
  | TranslationWorkerEventEnvelope;

export function createPreloadRequest(
  requestId: string,
  payload: TranslationPreloadRequest,
): TranslationWorkerPreloadRequest {
  return {
    kind: "request",
    command: "preload",
    requestId,
    payload,
  };
}

export function createTranslateRequest(
  requestId: string,
  payload: TranslationTextRequest,
): TranslationWorkerTranslateRequest {
  return {
    kind: "request",
    command: "translate",
    requestId,
    payload,
  };
}

export function createDisposeRequest(requestId: string): TranslationWorkerDisposeRequest {
  return {
    kind: "request",
    command: "dispose",
    requestId,
  };
}

export function createSuccessResponse<T>(
  command: TranslationWorkerCommand,
  requestId: string,
  payload: T,
): TranslationWorkerSuccessResponse<T> {
  return {
    kind: "success",
    command,
    requestId,
    payload,
  };
}

export function createTranslationResultResponse(
  requestId: string,
  payload: TranslationTextResult,
): TranslationWorkerSuccessResponse<TranslationTextResult> {
  return createSuccessResponse("translate", requestId, payload);
}

export function createErrorResponse(
  command: TranslationWorkerCommand,
  requestId: string,
  payload: TranslationWorkerErrorPayload,
): TranslationWorkerErrorResponse {
  return {
    kind: "error",
    command,
    requestId,
    payload,
  };
}

export function createEventEnvelope(payload: TranslationEvent): TranslationWorkerEventEnvelope {
  return {
    kind: "event",
    payload,
  };
}
