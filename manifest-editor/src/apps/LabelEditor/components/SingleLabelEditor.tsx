import { ResourceEditingProvider } from "../../../shell/ResourceEditingContext/ResourceEditingContext";
import { DescriptiveProperties } from "../../../editors/generic/DescriptiveProperties/DescriptiveProperties";

export function SingleLabelEditor({ resource }: { resource?: { id: string; type: "Canvas" } }) {
  if (!resource?.id) {
    return <div style={{ padding: "1em", textAlign: "center" }}>Select a resource</div>;
  }

  return (
    <div style={{ padding: "1em" }}>
      <ResourceEditingProvider resource={resource}>
        <DescriptiveProperties supported={["label"]} />
      </ResourceEditingProvider>
    </div>
  );
}
