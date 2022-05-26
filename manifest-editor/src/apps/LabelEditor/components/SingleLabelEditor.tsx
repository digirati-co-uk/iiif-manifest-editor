import { ResourceEditingProvider } from "../../../shell/ResourceEditingContext/ResourceEditingContext";
import { DescriptiveProperties } from "../../../editors/generic/DescriptiveProperties/DescriptiveProperties";
import { PaddedSidebarContainer } from "../../../atoms/PaddedSidebarContainer";

export function SingleLabelEditor({ resource }: { resource?: { id: string; type: "Canvas" } }) {
  if (!resource?.id) {
    return <div style={{ padding: "1em", textAlign: "center" }}>Select a resource</div>;
  }

  return (
    <PaddedSidebarContainer>
      <ResourceEditingProvider resource={resource}>
        <DescriptiveProperties supported={["label"]} />
      </ResourceEditingProvider>
    </PaddedSidebarContainer>
  );
}
