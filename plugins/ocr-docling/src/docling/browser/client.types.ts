import type { DoclingBatchResult, DoclingConvertRequest, DoclingEvent } from '../types'

export interface DoclingWorkerClient {
  preload(): Promise<void>
  convert(request: DoclingConvertRequest): Promise<DoclingBatchResult>
  onEvent(listener: (event: DoclingEvent) => void): () => void
  terminate(): void
}

export type { DoclingBatchResult, DoclingConvertRequest, DoclingEvent }
