import { useCanvas } from "react-iiif-vault/presentation-4";
import { ResourceEditingProvider } from "@manifest-editor/shell";
import { DescriptiveProperties } from "./DescriptiveProperties";
import { DescriptivePropertiesProps } from "./DescriptiveProperties.types";

export function DescriptivePropertiesCanvas(props: DescriptivePropertiesProps) {
  const canvas = useCanvas();

  return (
    <ResourceEditingProvider resource={canvas}>
      <DescriptiveProperties {...props} />
    </ResourceEditingProvider>
  );
}
