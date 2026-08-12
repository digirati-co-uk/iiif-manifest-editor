import { useAnnotation } from "react-iiif-vault/presentation-4";
import { ResourceEditingProvider } from "@manifest-editor/shell";
import { DescriptiveProperties } from "./DescriptiveProperties";
import { DescriptivePropertiesProps } from "./DescriptiveProperties.types";

export function DescriptivePropertiesAnnotation(props: DescriptivePropertiesProps) {
  const annotation = useAnnotation();

  return (
    <ResourceEditingProvider resource={annotation}>
      <DescriptiveProperties {...props} />
    </ResourceEditingProvider>
  );
}
