import type { UIMessage } from "@ai-sdk/react";
import type { ToolMode } from "@manifest-editor/tools";

export type OpenRouterPanelView = "threads" | "chat";

export type OpenRouterChatStatus = "ready" | "submitted" | "streaming" | "error";

export type OpenRouterStopReason =
  | "user"
  | "document-switch"
  | "thread-switch"
  | "new-thread"
  | "delete-thread"
  | "logout";

export interface OpenRouterMessageMetadata {
  modelId?: string;
  generatedAt?: number;
}

export interface OpenRouterThread {
  id: string;
  title: string;
  messages: UIMessage[];
  messageMetadata: Record<string, OpenRouterMessageMetadata>;
  createdAt: number;
  updatedAt: number;
}

export interface OpenRouterThreadBucket {
  key: string;
  threads: OpenRouterThread[];
  currentThreadId: string | null;
}

export interface OpenRouterModelPricing {
  prompt: string;
  completion: string;
  request: string;
  image: string;
}

export interface OpenRouterModelArchitecture {
  modality?: string;
  input_modalities?: string[];
  output_modalities?: string[];
  tokenizer?: string;
  instruct_type?: string | null;
}

export interface OpenRouterModel {
  id: string;
  canonical_slug?: string;
  name: string;
  created?: number;
  description?: string;
  context_length: number;
  supported_parameters: string[];
  pricing: OpenRouterModelPricing;
  architecture?: OpenRouterModelArchitecture;
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number | null;
    is_moderated?: boolean;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface ManifestEditorAiResourceSummary {
  id: string;
  type: string;
  label: string | null;
  summary: string | null;
  itemCount?: number;
  structureCount?: number;
  annotationCount?: number;
  behavior?: string[];
}

export interface ManifestEditorAiOutlineEntry {
  id: string;
  label: string | null;
  index: number;
}

export interface ManifestEditorAiManifestSummary {
  id: string;
  label: string | null;
  summary: string | null;
  canvasCount: number;
  topLevelRangeCount: number;
  canvases: ManifestEditorAiOutlineEntry[];
  canvasesTruncated: boolean;
  topLevelRanges: ManifestEditorAiOutlineEntry[];
  topLevelRangesTruncated: boolean;
}

export interface ManifestEditorAiCanvasSummary extends ManifestEditorAiResourceSummary {
  index: number | null;
  totalCanvases: number | null;
  width?: number;
  height?: number;
  duration?: number;
}

export interface ManifestEditorAiRangePathEntry {
  id: string;
  label: string | null;
}

export interface ManifestEditorAiRangeSummary extends ManifestEditorAiResourceSummary {
  path: ManifestEditorAiRangePathEntry[];
  childRangeCount?: number;
  canvasItemCount?: number;
}

export interface ManifestEditorAiContextSummary {
  mode: ToolMode;
  manifest: ManifestEditorAiManifestSummary;
  rootResource: ManifestEditorAiResourceSummary;
  currentSelection: ManifestEditorAiResourceSummary | null;
  stack: ManifestEditorAiResourceSummary[];
  activeCanvas: ManifestEditorAiCanvasSummary | null;
  activeRange: ManifestEditorAiRangeSummary | null;
  layout: {
    leftPanelId: string | null;
    centerPanelId: string | null;
    rightPanelId: string | null;
    rightPanelTab: string | null;
  };
  previewLink: string | null;
  systemPrompt: string;
}

export interface PresentOptionsChoice {
  id?: string;
  label: string;
  description?: string;
}

export interface PresentOptionsPayload {
  prompt?: string;
  options: PresentOptionsChoice[];
}
