import type {
  TranslationEvent,
  TranslationPreloadRequest,
  TranslationTextRequest,
  TranslationTextResult,
} from "../types";

export interface TranslationWorkerClient {
  preload(request: TranslationPreloadRequest): Promise<void>;
  translate(request: TranslationTextRequest): Promise<TranslationTextResult>;
  onEvent(listener: (event: TranslationEvent) => void): () => void;
  terminate(): void;
}
