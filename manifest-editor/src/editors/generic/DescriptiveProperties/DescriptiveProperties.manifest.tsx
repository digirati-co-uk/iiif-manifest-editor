import { useManifest } from "react-iiif-vault";
import { ResourceEditingProvider } from "../../../shell/ResourceEditingContext/ResourceEditingContext";
import { DescriptiveProperties } from "./DescriptiveProperties";
import { DescriptivePropertiesProps } from "./DescriptiveProperties.types";

export function DescriptivePropertiesManifest(props: DescriptivePropertiesProps) {
  const manifest = useManifest();

  return (
    <ResourceEditingProvider resource={manifest}>
      <DescriptiveProperties {...props} />
    </ResourceEditingProvider>
  );
}
