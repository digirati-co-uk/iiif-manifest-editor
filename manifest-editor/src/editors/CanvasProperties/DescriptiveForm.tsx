import { useContext } from "react";
import { LanguageMapInputCanvas } from "./LanguageMapInputCanvas";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { SingleValueInput } from "./SingleValueInputCanvas";
import { DateForm } from "./DateForm";

export const DescriptiveForm = () => {
  return (
    <>
      <LanguageMapInputCanvas
        dispatchType={"label"}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#label"}
      />
      <LanguageMapInputCanvas
        dispatchType={"summary"}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
      />
      <SingleValueInput dispatchType={"rights"} />
      <SingleValueInput dispatchType={"behavior"} />
      <DateForm />
      {/* <div>Time</div>  */}
    </>
  );
};
