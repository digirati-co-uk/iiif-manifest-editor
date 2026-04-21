export const DOCLING_MODEL_ID = 'onnx-community/granite-docling-258M-ONNX'
export const DOCLING_DEFAULT_PROMPT = 'Convert this page to docling.'

export const DOCLING_MODEL_OPTIONS = {
  device: 'webgpu',
  dtype: {
    embed_tokens: 'fp16',
    vision_encoder: 'fp32',
    decoder_model_merged: 'fp32',
  },
  doImageSplitting: true,
  maxNewTokens: 4096,
} as const
