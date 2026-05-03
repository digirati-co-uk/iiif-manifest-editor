import { useCallback, useEffect, useState } from "react";
import { OPENROUTER_DEFAULT_MODEL_ID, OPENROUTER_MODELS_URL } from "./constants";
import type { OpenRouterModel, OpenRouterModelsResponse } from "./types";

const autoRouterModel: OpenRouterModel = {
  id: OPENROUTER_DEFAULT_MODEL_ID,
  canonical_slug: OPENROUTER_DEFAULT_MODEL_ID,
  name: "Auto (Recommended)",
  description: "Let OpenRouter route requests across supported models automatically.",
  context_length: 200000,
  supported_parameters: ["tools"],
  pricing: {
    prompt: "0",
    completion: "0",
    request: "0",
    image: "0",
  },
};

function modelSupportsTools(model: OpenRouterModel) {
  return model.supported_parameters.includes("tools");
}

function dedupeModelsById(models: OpenRouterModel[]) {
  const seen = new Set<string>();

  return models.filter((model) => {
    if (seen.has(model.id)) {
      return false;
    }

    seen.add(model.id);
    return true;
  });
}

export function useOpenRouterModels(options: {
  apiKey: string | null;
  enabled?: boolean;
  toolsOnly?: boolean;
}) {
  const enabled = options.enabled ?? true;
  const toolsOnly = options.toolsOnly ?? true;
  const [models, setModels] = useState<OpenRouterModel[]>([autoRouterModel]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!options.apiKey) {
      setModels([autoRouterModel]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(OPENROUTER_MODELS_URL, {
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Failed to fetch models: ${response.status}`);
      }

      const payload: OpenRouterModelsResponse = await response.json();
      let nextModels = payload.data || [];
      if (toolsOnly) {
        nextModels = nextModels.filter(modelSupportsTools);
      }

      nextModels = nextModels.slice().sort((left, right) => left.name.localeCompare(right.name));
      setModels(dedupeModelsById([autoRouterModel, ...nextModels]));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch OpenRouter models.");
      setModels([autoRouterModel]);
    } finally {
      setIsLoading(false);
    }
  }, [options.apiKey, toolsOnly]);

  useEffect(() => {
    if (enabled) {
      void fetchModels();
    }
  }, [enabled, fetchModels]);

  return {
    models,
    isLoading,
    error,
    refetch: fetchModels,
  };
}
