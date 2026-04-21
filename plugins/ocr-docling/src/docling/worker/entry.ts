/// <reference lib="webworker" />

import {
  createBatchResultResponse,
  createErrorResponse,
  createEventEnvelope,
  createSuccessResponse,
  type DoclingWorkerRequest,
} from '../protocol'
import { DoclingWorkerRuntime } from './runtime'

const runtime = new DoclingWorkerRuntime()

self.addEventListener('message', async (message: MessageEvent<DoclingWorkerRequest>) => {
  const request = message.data
  if (request.kind !== 'request') {
    return
  }

  const respond = (payload: unknown) => {
    self.postMessage(payload)
  }

  try {
    switch (request.command) {
      case 'preload':
        await runtime.preload((event) => respond(createEventEnvelope(event)))
        respond(createSuccessResponse('preload', request.requestId, undefined))
        break
      case 'convert': {
        const result = await runtime.convert(
          request.requestId,
          request.payload,
          (event) => respond(createEventEnvelope(event)),
        )
        respond(createBatchResultResponse(request.requestId, result))
        break
      }
      case 'dispose':
        runtime.dispose()
        respond(createSuccessResponse('dispose', request.requestId, undefined))
        break
    }
  } catch (error) {
    const runtimeError = error instanceof Error
      ? {
          code: error.name as
            | 'busy'
            | 'generation_failed'
            | 'invalid_request'
            | 'model_load_failed'
            | 'page_load_failed'
            | 'unsupported_browser'
            | 'worker_failed',
          message: error.message,
          recoverable: error.name === 'busy' || error.name === 'invalid_request',
        }
      : {
          code: 'worker_failed' as const,
          message: 'The Docling worker failed unexpectedly.',
          recoverable: false,
        }

    respond(
      createEventEnvelope({
        type: 'error',
        requestId: request.requestId,
        code: runtimeError.code,
        message: runtimeError.message,
        recoverable: runtimeError.recoverable,
      }),
    )
    respond(createErrorResponse(request.command, request.requestId, runtimeError))
  }
})

export {}
