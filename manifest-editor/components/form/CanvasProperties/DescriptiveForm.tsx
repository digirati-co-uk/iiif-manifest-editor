import { useContext } from "react";
import { LanguageMapInputCanvas } from "./LanguageMapInputCanvas";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { SingleValueInput } from "../SingleValueInput";

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
      {/* <div>Required Statement</div> */}
      <SingleValueInput dispatchType={"rights"} />

      {/* <div>Date</div>
      <div>Time</div> */}
    </>
  );
};
