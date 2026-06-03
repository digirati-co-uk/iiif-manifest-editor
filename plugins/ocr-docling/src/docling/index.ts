export {
  DOCLING_DEFAULT_PROMPT,
  DOCLING_MODEL_ID,
  DOCLING_MODEL_OPTIONS,
} from './constants'
export { createDoclingWorkerClient } from './browser/client'
export type { DoclingWorkerClient } from './browser/client.types'
export { doclingToHtmlDocument, doclingToHtmlFragment } from './parser'
export { buildDoclingBatchResult, mergeDoclingPages } from './merge'
export {
  buildDoclingAnnotationPages,
  createDoclingAnnotations,
  createDoclingCanvasId,
  extractDoclingLayoutBoxes,
  extractDoclingRegions,
  stripDoclingMetadata,
} from './layout'
export {
  createBatchResultResponse,
  createConvertRequest,
  createDisposeRequest,
  createErrorResponse,
  createEventEnvelope,
  createPreloadRequest,
  createSuccessResponse,
} from './protocol'
export type {
  DoclingAnnotation,
  DoclingAnnotationBody,
  DoclingAnnotationPage,
  DoclingAnnotationTarget,
  DoclingBatchResult,
  DoclingConvertRequest,
  DoclingDocumentResult,
  DoclingErrorCode,
  DoclingEvent,
  DoclingLayoutBox,
  DoclingPageInput,
  DoclingPageResult,
  DoclingPageSource,
  DoclingParsedRegion,
} from './types'
