import { SingleValueInput } from "./SingleValueInput";
import { DateForm } from "./DateForm";
import { ThumbnailForm } from "./ThumbnailForm";
import { LogoForm } from "./LogoForm";
import { LanguageMapEditorManifest } from "../generic/LanguageMapEditor/LanguageMapEditor.manifest";

export const DescriptiveForm = () => {
  return (
    <>
      {/* Example using the full descriptive properties list. */}
      {/*<DescriptivePropertiesManifest supported={["label", "summary"]} />*/}

      <LanguageMapEditorManifest
        dispatchType={"label"}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#label"}
      />
      <LanguageMapEditorManifest
        dispatchType={"summary"}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
      />
      {/* @todo required statement isn't just a language map, its {label, value} */}
      {/*<LanguageMapInput*/}
      {/*  dispatchType={"requiredStatement"}*/}
      {/*  languages={editorContext?.languages || []}*/}
      {/*  guidanceReference={"https://iiif.io/api/presentation/3.0/#requiredStatement"}*/}
      {/*/>*/}
      <SingleValueInput dispatchType={"rights"} />
      <DateForm />
      {/* <div>Time</div> */}
      <ThumbnailForm />
      {/* <LogoForm /> */}
    </>
  );
};
