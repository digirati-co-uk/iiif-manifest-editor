import { ActionButton } from "../ActionButton";
import { useLocalStorage } from "./use-local-storage";

export function useGridOptions(
  name?: string,
  defaultGridSize?: "grid-sm" | "grid-md" | "grid-lg",
) {
  const [size, setSize] = useLocalStorage<"grid-sm" | "grid-md" | "grid-lg">(
    name || "default-grid-size",
    defaultGridSize || "grid-md",
  );

  const component = (
    <div className="flex gap-2 items-center" id="grid-options">
      <div className="opacity-50 text-sm">Grid size</div>
      <ActionButton
        primary={size === "grid-sm"}
        onPress={() => setSize("grid-sm")}
      >
        Small
      </ActionButton>
      <ActionButton
        primary={size === "grid-md"}
        onPress={() => setSize("grid-md")}
      >
        Medium
      </ActionButton>
      <ActionButton
        primary={size === "grid-lg"}
        onPress={() => setSize("grid-lg")}
      >
        Large
      </ActionButton>
    </div>
  );

  return [{ size }, component] as const;
}
