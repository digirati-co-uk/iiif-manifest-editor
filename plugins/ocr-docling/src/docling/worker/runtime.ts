import {
  AutoModelForVision2Seq,
  AutoProcessor,
  RawImage,
  TextStreamer,
  env,
} from '@huggingface/transformers'
import {
  DOCLING_MODEL_DTYPE_FP32,
  DOCLING_MODEL_ID,
  DOCLING_MODEL_OPTIONS,
} from '../constants'
import { buildDoclingBatchResult } from '../merge'
import { doclingToHtmlDocument } from '../parser'
import type {
  DoclingBatchResult,
  DoclingConvertRequest,
  DoclingErrorCode,
  DoclingEvent,
  DoclingPageInput,
  DoclingPageResult,
} from '../types'
import {
  createDoclingAnnotations,
  createDoclingCanvasId,
  extractDoclingRegions,
  stripDoclingMetadata,
} from '../layout'

type RuntimeState = {
  processor: Awaited<ReturnType<typeof AutoProcessor.from_pretrained>>
  model: Awaited<ReturnType<typeof AutoModelForVision2Seq.from_pretrained>>
}

type GpuAdapterLike = {
  features?: {
    has(feature: string): boolean
  }
}

type GpuNavigator = Navigator & {
  gpu?: {
    requestAdapter(): Promise<GpuAdapterLike | null>
  }
}

type ProgressInfo = {
  status?: string
  progress?: number
  loaded?: number
  total?: number
  files?: Record<string, { loaded: number; total: number }>
}

class DoclingRuntimeError extends Error {
  readonly code: DoclingErrorCode
  readonly recoverable: boolean

  constructor(code: DoclingErrorCode, message: string, recoverable: boolean) {
    super(message)
    this.code = code
    this.recoverable = recoverable
    this.name = code
  }
}

function serializeUnknownError(
  error: unknown,
  fallbackCode: DoclingErrorCode,
  recoverable = false,
): DoclingRuntimeError {
  if (error instanceof DoclingRuntimeError) {
    return error
  }

  if (error instanceof Error) {
    return new DoclingRuntimeError(fallbackCode, error.message, recoverable)
  }

  return new DoclingRuntimeError(
    fallbackCode,
    'An unknown runtime error occurred.',
    recoverable,
  )
}

async function resolvePageImage(page: DoclingPageInput): Promise<RawImage> {
  try {
    if (typeof page.source === 'string') {
      const response = await fetch(page.source)
      if (!response.ok) {
        throw new Error(`Failed to fetch "${page.source}" (${response.status}).`)
      }

      return await RawImage.fromBlob(await response.blob())
    }

    return await RawImage.fromBlob(page.source)
  } catch (error) {
    throw serializeUnknownError(error, 'page_load_failed', true)
  }
}

export class DoclingWorkerRuntime {
  private runtimePromise: Promise<RuntimeState> | null = null
  private activeRequestId: string | null = null
  private readonly modelId = DOCLING_MODEL_ID

  async preload(emit: (event: DoclingEvent) => void): Promise<void> {
    await this.getRuntime(emit)
  }

  async convert(
    requestId: string,
    request: DoclingConvertRequest,
    emit: (event: DoclingEvent) => void,
  ): Promise<DoclingBatchResult> {
    if (this.activeRequestId && this.activeRequestId !== requestId) {
      throw new DoclingRuntimeError(
        'busy',
        'The Docling worker is already processing another request.',
        true,
      )
    }

    if (request.pages.length === 0) {
      throw new DoclingRuntimeError(
        'invalid_request',
        'At least one page is required.',
        true,
      )
    }

    const startedAt = performance.now()
    this.activeRequestId = requestId

    try {
      const runtime = await this.getRuntime(emit)
      const pages: DoclingPageResult[] = []

      for (const [pageIndex, page] of request.pages.entries()) {
        emit({
          type: 'page-start',
          requestId,
          pageId: page.id,
          pageName: page.name,
          pageIndex,
          totalPages: request.pages.length,
        })

        const pageResult = await this.convertPage(
          requestId,
          page,
          pageIndex,
          request.prompt,
          runtime,
          emit,
        )

        pages.push(pageResult)

        emit({
          type: 'page-complete',
          requestId,
          pageId: page.id,
          pageIndex,
          totalPages: request.pages.length,
          page: pageResult,
        })
      }

      return buildDoclingBatchResult(pages, performance.now() - startedAt)
    } catch (error) {
      throw serializeUnknownError(error, 'generation_failed')
    } finally {
      this.activeRequestId = null
    }
  }

  dispose(): void {
    this.runtimePromise = null
    this.activeRequestId = null
  }

  private async getRuntime(
    emit: (event: DoclingEvent) => void,
  ): Promise<RuntimeState> {
    if (this.runtimePromise) {
      return this.runtimePromise
    }

    const adapter = await getWebGpuAdapter()
    this.runtimePromise = this.loadRuntime(emit, adapter)

    return this.runtimePromise
  }

  private async loadRuntime(
    emit: (event: DoclingEvent) => void,
    adapter: GpuAdapterLike,
  ): Promise<RuntimeState> {
    try {
      configureBrowserCache()
      const dtype = getDoclingModelDtype(adapter)
      const processor = await AutoProcessor.from_pretrained(this.modelId)
      const model = await AutoModelForVision2Seq.from_pretrained(this.modelId, {
        device: DOCLING_MODEL_OPTIONS.device,
        dtype,
        progress_callback: (info: ProgressInfo) => {
          if (info.status !== 'progress_total') {
            return
          }

          emit({
            type: 'model-progress',
            progress: info.progress ?? 0,
            loaded: info.loaded ?? 0,
            total: info.total ?? 0,
            files: info.files ?? {},
          })
        },
      })

      emit({
        type: 'model-ready',
        modelId: this.modelId,
      })

      return {
        processor,
        model,
      }
    } catch (error) {
      this.runtimePromise = null
      throw serializeUnknownError(error, 'model_load_failed')
    }
  }

  private async convertPage(
    requestId: string,
    page: DoclingPageInput,
    pageIndex: number,
    prompt: string,
    runtime: RuntimeState,
    emit: (event: DoclingEvent) => void,
  ): Promise<DoclingPageResult> {
    const startedAt = performance.now()
    const image = await resolvePageImage(page)
    let rawDocling = ''

    const messages = [
      {
        role: 'user',
        content: [{ type: 'image' }, { type: 'text', text: prompt }],
      },
    ]

    const text = runtime.processor.apply_chat_template(messages, {
      add_generation_prompt: true,
    })

    try {
      const inputs = await runtime.processor(text, [image], {
        do_image_splitting: DOCLING_MODEL_OPTIONS.doImageSplitting,
      })
      const tokenizer = runtime.processor.tokenizer
      if (!tokenizer) {
        throw new DoclingRuntimeError(
          'model_load_failed',
          'The Docling processor did not provide a tokenizer.',
          false,
        )
      }

      await runtime.model.generate({
        ...inputs,
        max_new_tokens: DOCLING_MODEL_OPTIONS.maxNewTokens,
        streamer: new TextStreamer(tokenizer, {
          skip_prompt: true,
          skip_special_tokens: false,
          callback_function: (chunk: string) => {
            rawDocling += chunk
            emit({
              type: 'page-token',
              requestId,
              pageId: page.id,
              pageIndex,
              chunk,
              text: rawDocling,
            })
          },
        }),
      })

      const docling = stripDoclingMetadata(rawDocling)
      const regions = extractDoclingRegions(rawDocling)
      const canvasId = createDoclingCanvasId()

      return {
        id: page.id,
        name: page.name,
        rawDocling,
        docling,
        html: doclingToHtmlDocument(docling),
        canvasId,
        boxes: regions.map((region) => region.bbox),
        annotations: createDoclingAnnotations(regions, canvasId),
        durationMs: performance.now() - startedAt,
      }
    } catch (error) {
      const runtimeError = serializeUnknownError(error, 'generation_failed')
      emit({
        type: 'error',
        requestId,
        code: runtimeError.code,
        message: runtimeError.message,
        recoverable: runtimeError.recoverable,
      })
      throw runtimeError
    }
  }
}

async function getWebGpuAdapter(): Promise<GpuAdapterLike> {
  if (typeof navigator === 'undefined') {
    throw new DoclingRuntimeError(
      'unsupported_browser',
      'WebGPU is not available in this browser. Use a recent Chromium-based browser with WebGPU enabled.',
      false,
    )
  }

  const gpu = (navigator as GpuNavigator).gpu
  if (!gpu) {
    throw new DoclingRuntimeError(
      'unsupported_browser',
      'WebGPU is not available in this browser. Use a recent Chromium-based browser with WebGPU enabled.',
      false,
    )
  }

  try {
    const adapter = await gpu.requestAdapter()
    if (!adapter) {
      throw new DoclingRuntimeError(
        'unsupported_browser',
        'WebGPU is available, but no compatible GPU adapter was found.',
        false,
      )
    }

    return adapter
  } catch (error) {
    if (error instanceof DoclingRuntimeError) {
      throw error
    }

    throw serializeUnknownError(error, 'unsupported_browser')
  }
}

function getDoclingModelDtype(adapter: GpuAdapterLike) {
  return adapter.features?.has('shader-f16')
    ? DOCLING_MODEL_OPTIONS.dtype
    : DOCLING_MODEL_DTYPE_FP32
}

function configureBrowserCache() {
  if (typeof caches === 'undefined') {
    return
  }

  env.useBrowserCache = true
  env.useWasmCache = true
  env.cacheKey = 'manifest-editor-ocr-docling'
}
