import { useContext } from "react";
import { LanguageMapInputCanvas } from "./LanguageMapInputCanvas";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { SingleValueInput } from "./SingleValueInputCanvas";
import { MetadataEditor } from "../MetadataEditor";

export const DescriptiveForm = () => {
  const editorContext = useContext(ManifestEditorContext);

  return (
    <>
      <LanguageMapInputCanvas
        dispatchType={"label"}
        languages={editorContext?.languages || []}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#label"}
      />
      <LanguageMapInputCanvas
        dispatchType={"summary"}
        languages={editorContext?.languages || []}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
      />
      {/* <MetadataEditor dispatchType="requiredStatement" /> */}
      <SingleValueInput dispatchType={"rights"} />
      <SingleValueInput dispatchType={"behavior"} />

      {/* <div>Date</div>
      <div>Time</div> */}
    </>
  );
};
