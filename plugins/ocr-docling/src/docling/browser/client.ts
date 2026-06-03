import {
  createConvertRequest,
  createDisposeRequest,
  createPreloadRequest,
  type DoclingWorkerCommand,
  type DoclingWorkerResponse,
} from '../protocol'
import type {
  DoclingBatchResult,
  DoclingConvertRequest,
  DoclingEvent,
  DoclingWorkerClient,
} from './client.types'

type PendingRequest = {
  command: DoclingWorkerCommand
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}

export interface CreateDoclingWorkerClientOptions {
  worker?: Worker
}

function randomRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `docling-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createDoclingWorkerClient(
  options: CreateDoclingWorkerClientOptions = {},
): DoclingWorkerClient {
  const worker =
    options.worker ??
    new Worker(new URL('./docling-worker.js', import.meta.url), {
      type: 'module',
    })

  const listeners = new Set<(event: DoclingEvent) => void>()
  const pendingRequests = new Map<string, PendingRequest>()
  let terminated = false

  const emit = (event: DoclingEvent) => {
    for (const listener of listeners) {
      listener(event)
    }
  }

  const failAllPending = (reason: unknown) => {
    for (const request of pendingRequests.values()) {
      request.reject(reason)
    }
    pendingRequests.clear()
  }

  worker.addEventListener('message', (message: MessageEvent<DoclingWorkerResponse>) => {
    const payload = message.data

    if (payload.kind === 'event') {
      emit(payload.payload)
      return
    }

    const pendingRequest = pendingRequests.get(payload.requestId)
    if (!pendingRequest) {
      return
    }

    pendingRequests.delete(payload.requestId)

    if (payload.kind === 'error') {
      const error = new Error(payload.payload.message)
      error.name = payload.payload.code
      pendingRequest.reject(error)
      return
    }

    pendingRequest.resolve(payload.payload)
  })

  worker.addEventListener('error', (event) => {
    const error = new Error(event.message || 'The Docling worker crashed.')
    error.name = 'worker_failed'
    emit({
      type: 'error',
      code: 'worker_failed',
      message: error.message,
      recoverable: false,
    })
    failAllPending(error)
  })

  const send = <T>(command: DoclingWorkerCommand, request: object): Promise<T> => {
    if (terminated) {
      return Promise.reject(new Error('The Docling worker client has been terminated.'))
    }

    const requestId = randomRequestId()
    const envelope =
      command === 'convert'
        ? createConvertRequest(
            requestId,
            (request as { payload: DoclingConvertRequest }).payload,
          )
        : command === 'dispose'
          ? createDisposeRequest(requestId)
          : createPreloadRequest(requestId)

    return new Promise<T>((resolve, reject) => {
      pendingRequests.set(requestId, {
        command,
        resolve: (value: unknown) => {
          resolve(value as T)
        },
        reject,
      })
      worker.postMessage(envelope)
    })
  }

  return {
    async preload() {
      await send<void>('preload', {})
    },
    convert(request: DoclingConvertRequest) {
      return send<DoclingBatchResult>('convert', { payload: request })
    },
    onEvent(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    terminate() {
      if (terminated) {
        return
      }

      terminated = true
      worker.postMessage(createDisposeRequest(randomRequestId()))
      worker.terminate()
      failAllPending(new Error('The Docling worker client has been terminated.'))
    },
  }
}
