import { useContext } from "react";
import { LanguageMapInput } from "../LanguageMapInput";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { SingleValueInput } from "../SingleValueInput";
import { DateForm } from "./DateForm";

export const DescriptiveForm = () => {
  const editorContext = useContext(ManifestEditorContext);

  return (
    <>
      <LanguageMapInput
        dispatchType={"label"}
        languages={editorContext?.languages || []}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#label"}
      />
      <LanguageMapInput
        dispatchType={"summary"}
        languages={editorContext?.languages || []}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
      />
      <LanguageMapInput
        dispatchType={"requiredStatement"}
        languages={editorContext?.languages || []}
        guidanceReference={
          "https://iiif.io/api/presentation/3.0/#requiredStatement"
        }
      />
      <SingleValueInput dispatchType={"rights"} />
      <DateForm />
      {/* <div>Time</div> */}
    </>
  );
};
