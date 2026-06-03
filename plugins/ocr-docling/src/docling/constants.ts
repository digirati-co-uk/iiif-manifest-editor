export const DOCLING_MODEL_ID = 'onnx-community/granite-docling-258M-ONNX'
export const DOCLING_DEFAULT_PROMPT = 'Convert this page to docling.'

export const DOCLING_MODEL_DTYPE_SHADER_F16 = {
  embed_tokens: 'fp16',
  vision_encoder: 'fp32',
  decoder_model_merged: 'fp32',
} as const

export const DOCLING_MODEL_DTYPE_FP32 = {
  embed_tokens: 'fp32',
  vision_encoder: 'fp32',
  decoder_model_merged: 'fp32',
} as const

export const DOCLING_MODEL_OPTIONS = {
  device: 'webgpu',
  dtype: DOCLING_MODEL_DTYPE_SHADER_F16,
  doImageSplitting: true,
  maxNewTokens: 4096,
} as const
