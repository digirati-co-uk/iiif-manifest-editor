import { useState } from "react";
import { useCanvas } from "react-iiif-vault";
import { SecondaryButton } from "../../atoms/Button";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../atoms/PaddingComponent";
import { RadioButtons } from "../../atoms/RadioButtons";
import { FlexContainerRow } from "../../components/layout/FlexContainer";
import { useAnnotationList } from "../../hooks/useAnnotationsList";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";
import { LanguageFieldEditor } from "../generic/LanguageFieldEditor/LanguageFieldEditor";
import { Input } from "../Input";

export function NewAnnotationPageForm() {
  const canvas = useCanvas();
  const { addNewAnnotationPage } = useAnnotationList(canvas?.id || "");
  const { defaultLanguages } = useConfig();
  const [selected, setSelected] = useState(0);

  const options = [
    { label: "Store annotations in the Manifest can be edited in the Manifest Editor", value: "embedded" },
    { label: " Link to an external Annotation Page for annotations created elsewhere", value: "external" },
  ];

  return (
    <>
      <h4>Create new Annotation Page</h4>
      <form onSubmit={addNewAnnotationPage}>
        <div style={{ paddingRight: "1.5rem" }}>
          <RadioButtons options={options} selectedIndex={selected} onChange={(index) => setSelected(index)} />
        </div>

        <LanguageFieldEditor
          label={"label"}
          fields={{}}
          availableLanguages={defaultLanguages}
          onSave={() => {
            //DO Something
          }}
          property={"label"}
        />
        <FlexContainerRow>
          <Input
            placeholder={"Annotation Page URL"}
            onChange={() => {
              //DO Something
            }}
            property={"label"}
          />
          <PaddingComponentMedium />
        </FlexContainerRow>
        <PaddingComponentMedium />
        <SecondaryButton onClick={addNewAnnotationPage}> Create annotation page</SecondaryButton>
      </form>
    </>
  );
}
