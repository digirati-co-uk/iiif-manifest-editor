import { useState } from "react";
import { useCanvas } from "react-iiif-vault";
import { Button, SecondaryButton } from "@/atoms/Button";
import { LightBox } from "@/atoms/LightBox";
import { PaddingComponentMedium } from "@/atoms/PaddingComponent";
import { RadioButtons } from "@/atoms/RadioButtons";
import { FlexContainerRow } from "@/components/layout/FlexContainer";
import { useAnnotationList } from "@/hooks/useAnnotationsList";
import { BackIcon } from "@/icons/BackIcon";
import { useConfig } from "@/shell";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { Input } from "@/editors/Input";

export const NewAnnotationPageForm: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const canvas = useCanvas();
  const { addNewAnnotationPage } = useAnnotationList(canvas?.id || "");
  const { defaultLanguages } = useConfig();
  const [selected, setSelected] = useState(0);

  const [label, setLabel] = useState<any>();
  const [url, setUrl] = useState("");

  const options = [
    { label: "Store annotations in the Manifest which can be edited in the Manifest Editor", value: "embedded" },
    { label: " Link to an external Annotation Page for annotations created elsewhere", value: "external" },
  ];

  return (
    <LightBox>
      <PaddingComponentMedium>
        <FlexContainerRow style={{ alignItems: "center" }}>
          <Button style={{ cursor: "pointer" }} onClick={goBack} title={"go back"}>
            <BackIcon aria-label={"go back"} />
          </Button>
          <h4>Create new Annotation Page</h4>
        </FlexContainerRow>
      </PaddingComponentMedium>

      <div style={{ paddingRight: "1.5rem" }}>
        <RadioButtons options={options} selectedIndex={selected} onChange={(index) => setSelected(index)} />
      </div>

      <LanguageFieldEditor
        label={"label"}
        availableLanguages={defaultLanguages}
        onSave={(e: any) => {
          setLabel(e.toInternationalString());
        }}
        property={"label"}
        fields={{}}
      />
      {selected === 1 && (
        <FlexContainerRow>
          <Input placeholder={"Annotation Page URL"} onChange={(e) => setUrl(e.target.value)} property={"label"} />
          <PaddingComponentMedium />
        </FlexContainerRow>
      )}
      <PaddingComponentMedium />
      <SecondaryButton onClick={() => addNewAnnotationPage(url, label, selected === 0, goBack)}>
        Create annotation page
      </SecondaryButton>
    </LightBox>
  );
};
