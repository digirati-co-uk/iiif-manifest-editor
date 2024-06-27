import { cn } from "./utils";

export function OpaqueControls(props: { children: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={cn("flex w-full p-0.5 opacity-0 transition-opacity duration-300 gap-2", props.active && "opacity-1")}
    >
      {props.children}
    </div>
  );
}
