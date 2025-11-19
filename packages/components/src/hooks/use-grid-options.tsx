import { ActionButton } from "../ActionButton";
import { useLocalStorage } from "./use-local-storage";

export function useGridOptions(
  //
  name?: string,
  options: {
    defaultGridSize?: "grid-sm" | "grid-md" | "grid-lg";
    onDark?: boolean;
  } = {},
) {
  const { defaultGridSize = "grid-md", onDark = false } = options;
  const [size, setSize] = useLocalStorage<"grid-sm" | "grid-md" | "grid-lg">(
    name || "default-grid-size",
    defaultGridSize || "grid-md",
  );

  const component = (
    <div className="flex gap-2 items-center" id="grid-options">
      <div className={onDark ? "opacity-90 text-white text-sm" : "opacity-90 text-sm"}>Grid size:</div>
      <ActionButton onDark={onDark} primary={size === "grid-sm"} onPress={() => setSize("grid-sm")}>
        Small
      </ActionButton>
      <ActionButton onDark={onDark} primary={size === "grid-md"} onPress={() => setSize("grid-md")}>
        Medium
      </ActionButton>
      <ActionButton onDark={onDark} primary={size === "grid-lg"} onPress={() => setSize("grid-lg")}>
        Large
      </ActionButton>
    </div>
  );

  return [{ size }, component] as const;
}
