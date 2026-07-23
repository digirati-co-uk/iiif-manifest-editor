export type RemoteInferenceModelOption = {
  key: string;
  label: string;
};

export const REMOTE_INFERENCE_MODELS: RemoteInferenceModelOption[] = [
  { key: "glm-ocr", label: "GLM OCR (1B)" },
  { key: "gemma-ocr-medium", label: "Gemma 3 (4B)" },
  { key: "qwen-ocr", label: "Qwen 3.6 (9B)" },
  { key: "gemma-ocr-large", label: "Gemma 4 (31B)" },
  { key: "qwen-ocr-large", label: "Qwen 3.6 (35B)" },
];

export function getCustomModels(value: unknown): RemoteInferenceModelOption[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (model): model is RemoteInferenceModelOption =>
        typeof model?.key === "string" &&
        !!model.key.trim() &&
        typeof model?.label === "string" &&
        !!model.label.trim(),
    )
    .map((model) => ({ key: model.key.trim(), label: model.label.trim() }));
}

export function getRemoteInferenceModels(models: unknown): RemoteInferenceModelOption[] {
  const customModels = getCustomModels(models);
  const existingKeys = new Set(REMOTE_INFERENCE_MODELS.map((model) => model.key));
  return [
    ...REMOTE_INFERENCE_MODELS,
    ...customModels.filter((model) => {
      if (existingKeys.has(model.key)) return false;
      existingKeys.add(model.key);
      return true;
    }),
  ];
}
