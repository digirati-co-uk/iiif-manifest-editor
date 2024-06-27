import { LanguageMapEditor } from "../LanguageMapEditor/LanguageMapEditor";
import { DescriptivePropertiesProps } from "./DescriptiveProperties.types";

export function DescriptiveProperties({ supported }: DescriptivePropertiesProps) {
  const fields = (
    <>
      {supported.includes("label") && (
        <LanguageMapEditor dispatchType={"label"} guidanceReference={"https://iiif.io/api/presentation/3.0/#label"} />
      )}
      {supported.includes("summary") && (
        <LanguageMapEditor
          dispatchType={"summary"}
          guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
        />
      )}
    </>
  );

  // @todo form

  return <>{fields}</>;
}
