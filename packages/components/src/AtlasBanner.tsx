import { ReactNode } from "react";

export function AtlasBanner({ children, controlsId }: { controlsId: string; children: ReactNode }) {
  return (
    <div className="bg-me-gray-100 border-b text-black p-1 flex gap-4 items-center h-12">
      <div className="px-4">{children}</div>
      <div id={controlsId || "atlas-controls"} className="flex gap-2" />
    </div>
  );
}
