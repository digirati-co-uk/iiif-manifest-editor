export type DoclingPageSource = File | Blob | string

export interface DoclingPageInput {
  id: string
  name?: string
  source: DoclingPageSource
}

export interface DoclingConvertRequest {
  pages: DoclingPageInput[]
  prompt: string
}

export interface DoclingLayoutBox {
  left: number
  top: number
  right: number
  bottom: number
}

export interface DoclingParsedRegion {
  category: string
  text: string
  bbox: DoclingLayoutBox
}

export interface DoclingAnnotationBody {
  type: 'TextualBody'
  value: string
  purpose?: 'tagging'
  format?: 'text/plain'
}

export interface DoclingAnnotationTarget {
  source: string
  selector: {
    type: 'FragmentSelector'
    conformsTo: 'http://www.w3.org/TR/media-frags/'
    value: string
  }
}

export interface DoclingAnnotation {
  id: string
  type: 'Annotation'
  motivation: 'supplementing'
  category: string
  body: DoclingAnnotationBody[]
  target: DoclingAnnotationTarget
}

export interface DoclingAnnotationPage {
  id: string
  type: 'AnnotationPage'
  category: string
  items: DoclingAnnotation[]
}

export interface DoclingPageResult {
  id: string
  name?: string
  rawDocling: string
  docling: string
  html: string
  canvasId: string
  boxes: DoclingLayoutBox[]
  annotations: DoclingAnnotation[]
  durationMs: number
}

export interface DoclingDocumentResult {
  docling: string
  html: string
  pageCount: number
  durationMs: number
}

export interface DoclingBatchResult {
  document: DoclingDocumentResult
  pages: DoclingPageResult[]
  annotationPages: DoclingAnnotationPage[]
}

export type DoclingErrorCode =
  | 'busy'
  | 'generation_failed'
  | 'invalid_request'
  | 'model_load_failed'
  | 'page_load_failed'
  | 'unsupported_browser'
  | 'worker_failed'

export interface DoclingModelProgressEvent {
  type: 'model-progress'
  progress: number
  loaded: number
  total: number
  files: Record<string, { loaded: number; total: number }>
}

export interface DoclingModelReadyEvent {
  type: 'model-ready'
  modelId: string
}

export interface DoclingPageStartEvent {
  type: 'page-start'
  requestId: string
  pageId: string
  pageName?: string
  pageIndex: number
  totalPages: number
}

export interface DoclingPageTokenEvent {
  type: 'page-token'
  requestId: string
  pageId: string
  pageIndex: number
  chunk: string
  text: string
}

export interface DoclingPageCompleteEvent {
  type: 'page-complete'
  requestId: string
  pageId: string
  pageIndex: number
  totalPages: number
  page: DoclingPageResult
}

export interface DoclingErrorEvent {
  type: 'error'
  code: DoclingErrorCode
  message: string
  recoverable: boolean
  requestId?: string
}

export type DoclingEvent =
  | DoclingModelProgressEvent
  | DoclingModelReadyEvent
  | DoclingPageStartEvent
  | DoclingPageTokenEvent
  | DoclingPageCompleteEvent
  | DoclingErrorEvent
