import { getValue } from "@iiif/helpers";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useVault } from "react-iiif-vault";
import { useInStack } from "../../helpers";

export function TimelineEditor() {
  const timeline = useInStack("Timeline");
  const vault = useVault();
  const timelineRef = timeline?.resource.source;
  const resource = timelineRef ? vault.get(timelineRef as any, { skipSelfReturn: false }) : undefined;

  if (!timelineRef) return <EmptyState>No timeline selected</EmptyState>;

  return (
    <div className="flex h-full items-center justify-center bg-me-gray-50 p-8">
      <EmptyState>
        <strong>{getValue(resource?.label) || "Untitled timeline"}</strong>
        <div className="mt-2 text-sm text-me-gray-500">
          {typeof resource?.duration === "number" ? `${resource.duration} seconds` : "Timeline"}
        </div>
        <div className="mt-2 text-sm">Edit this timeline using the properties panel.</div>
      </EmptyState>
    </div>
  );
}
