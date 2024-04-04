import { useAnnotation } from "react-iiif-vault";
import { ResourceEditingProvider } from "@/shell/ResourceEditingContext/ResourceEditingContext";
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
