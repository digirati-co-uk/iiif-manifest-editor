import { DescriptivePropertiesProps } from "./DescriptiveProperties.types";
import { useManifestEditor } from "../../../apps/ManifestEditor/ManifestEditor.context";
import { LanguageMapEditor } from "../LanguageMapEditor/LanguageMapEditor";

export function DescriptiveProperties({ supported }: DescriptivePropertiesProps) {
  const { languages } = useManifestEditor();

  return (
    <>
      {supported.includes("label") && (
        <LanguageMapEditor
          dispatchType={"label"}
          languages={languages || []}
          guidanceReference={"https://iiif.io/api/presentation/3.0/#label"}
        />
      )}
      {supported.includes("summary") && (
        <LanguageMapEditor
          dispatchType={"summary"}
          languages={languages || []}
          guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
        />
      )}
    </>
  );
}
