import type {
  DoclingBatchResult,
  DoclingConvertRequest,
  DoclingErrorCode,
  DoclingEvent,
} from './types'

export type DoclingWorkerCommand = 'preload' | 'convert' | 'dispose'

export interface DoclingWorkerRequestBase {
  kind: 'request'
  command: DoclingWorkerCommand
  requestId: string
}

export interface DoclingWorkerPreloadRequest extends DoclingWorkerRequestBase {
  command: 'preload'
}

export interface DoclingWorkerConvertRequest extends DoclingWorkerRequestBase {
  command: 'convert'
  payload: DoclingConvertRequest
}

export interface DoclingWorkerDisposeRequest extends DoclingWorkerRequestBase {
  command: 'dispose'
}

export type DoclingWorkerRequest =
  | DoclingWorkerPreloadRequest
  | DoclingWorkerConvertRequest
  | DoclingWorkerDisposeRequest

export interface DoclingWorkerSuccessResponse<T = undefined> {
  kind: 'success'
  requestId: string
  command: DoclingWorkerCommand
  payload: T
}

export interface DoclingWorkerErrorPayload {
  code: DoclingErrorCode
  message: string
  recoverable: boolean
}

export interface DoclingWorkerErrorResponse {
  kind: 'error'
  requestId: string
  command: DoclingWorkerCommand
  payload: DoclingWorkerErrorPayload
}

export interface DoclingWorkerEventEnvelope {
  kind: 'event'
  payload: DoclingEvent
}

export type DoclingWorkerResponse<T = undefined> =
  | DoclingWorkerSuccessResponse<T>
  | DoclingWorkerErrorResponse
  | DoclingWorkerEventEnvelope

export function createPreloadRequest(
  requestId: string,
): DoclingWorkerPreloadRequest {
  return {
    kind: 'request',
    command: 'preload',
    requestId,
  }
}

export function createConvertRequest(
  requestId: string,
  payload: DoclingConvertRequest,
): DoclingWorkerConvertRequest {
  return {
    kind: 'request',
    command: 'convert',
    requestId,
    payload,
  }
}

export function createDisposeRequest(
  requestId: string,
): DoclingWorkerDisposeRequest {
  return {
    kind: 'request',
    command: 'dispose',
    requestId,
  }
}

export function createSuccessResponse<T>(
  command: DoclingWorkerCommand,
  requestId: string,
  payload: T,
): DoclingWorkerSuccessResponse<T> {
  return {
    kind: 'success',
    command,
    requestId,
    payload,
  }
}

export function createBatchResultResponse(
  requestId: string,
  payload: DoclingBatchResult,
): DoclingWorkerSuccessResponse<DoclingBatchResult> {
  return createSuccessResponse('convert', requestId, payload)
}

export function createErrorResponse(
  command: DoclingWorkerCommand,
  requestId: string,
  payload: DoclingWorkerErrorPayload,
): DoclingWorkerErrorResponse {
  return {
    kind: 'error',
    command,
    requestId,
    payload,
  }
}

export function createEventEnvelope(
  payload: DoclingEvent,
): DoclingWorkerEventEnvelope {
  return {
    kind: 'event',
    payload,
  }
}
