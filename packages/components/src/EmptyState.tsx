import { cn } from "./utils";

export function EmptyState(props: { children: React.ReactNode; $noMargin?: boolean; $box?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-gray-400 text-md",
        props.$noMargin ? "" : "m-4",
        props.$box ? "p-4 border border-gray-200 rounded" : ""
      )}
    >
      {props.children}
    </div>
  );
}
