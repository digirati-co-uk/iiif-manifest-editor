import { describe, expect, test } from 'vitest'
import {
  createBatchResultResponse,
  createConvertRequest,
  createErrorResponse,
  createEventEnvelope,
  createPreloadRequest,
  createSuccessResponse,
} from '../protocol'

describe('worker protocol helpers', () => {
  test('creates preload and convert requests with stable envelopes', () => {
    expect(createPreloadRequest('req-preload')).toEqual({
      kind: 'request',
      command: 'preload',
      requestId: 'req-preload',
    })

    expect(
      createConvertRequest('req-convert', {
        prompt: 'Convert this page to docling.',
        pages: [{ id: 'page-1', source: 'https://example.com/page.png' }],
      }),
    ).toEqual({
      kind: 'request',
      command: 'convert',
      requestId: 'req-convert',
      payload: {
        prompt: 'Convert this page to docling.',
        pages: [{ id: 'page-1', source: 'https://example.com/page.png' }],
      },
    })
  })

  test('creates success, batch-result, error, and event envelopes', () => {
    expect(createSuccessResponse('dispose', 'req-1', undefined)).toEqual({
      kind: 'success',
      command: 'dispose',
      requestId: 'req-1',
      payload: undefined,
    })

    expect(
      createBatchResultResponse('req-2', {
        document: {
          docling: '<doctag></doctag>',
          html: '<html></html>',
          pageCount: 1,
          durationMs: 5,
        },
        pages: [],
        annotationPages: [],
      }),
    ).toEqual({
      kind: 'success',
      command: 'convert',
      requestId: 'req-2',
      payload: {
        document: {
          docling: '<doctag></doctag>',
          html: '<html></html>',
          pageCount: 1,
          durationMs: 5,
        },
        pages: [],
        annotationPages: [],
      },
    })

    expect(
      createErrorResponse('convert', 'req-3', {
        code: 'busy',
        message: 'Already running.',
        recoverable: true,
      }),
    ).toEqual({
      kind: 'error',
      command: 'convert',
      requestId: 'req-3',
      payload: {
        code: 'busy',
        message: 'Already running.',
        recoverable: true,
      },
    })

    expect(
      createEventEnvelope({
        type: 'model-ready',
        modelId: 'onnx-community/granite-docling-258M-ONNX',
      }),
    ).toEqual({
      kind: 'event',
      payload: {
        type: 'model-ready',
        modelId: 'onnx-community/granite-docling-258M-ONNX',
      },
    })
  })
})
