import type { OpenRouterModel } from "../types";

export function ModelSelector(props: {
  selectedModelId: string;
  models: OpenRouterModel[];
  disabled?: boolean;
  onSelectModel: (modelId: string) => void;
}) {
  return (
    <select
      value={props.selectedModelId}
      disabled={props.disabled}
      onChange={(event) => props.onSelectModel(event.target.value)}
      className="rounded bg-transparent px-1 py-0.5 text-xs text-me-gray-700 outline-none hover:bg-me-gray-100 focus:bg-me-gray-100 disabled:opacity-50"
    >
      {props.models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
