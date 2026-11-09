import { useTranslations } from "@manifest-editor/i18n";
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
  const t = useTranslations("ui");
  const canvas = useCanvas();
  const { addNewAnnotationPage } = useAnnotationList(canvas?.id || "");
  const { defaultLanguages } = useConfig();
  const [selected, setSelected] = useState(0);

  const [label, setLabel] = useState<any>();
  const [url, setUrl] = useState("");

  const options = [
    { label: t("annotation.embedded"), value: "embedded" },
    { label: t("annotation.linked"), value: "external" },
  ];

  return (
    <LightBox>
      <PaddingComponentMedium>
        <FlexContainerRow style={{ alignItems: "center" }}>
          <Button style={{ cursor: "pointer" }} onClick={goBack} title={t("actions.back")}>
            <BackIcon aria-label={t("actions.back")} />
          </Button>
          <h4>{t("annotation.newPage")}</h4>
        </FlexContainerRow>
      </PaddingComponentMedium>

      <div style={{ paddingRight: "1.5rem" }}>
        <RadioButtons options={options} selectedIndex={selected} onChange={(index) => setSelected(index)} />
      </div>

      <LanguageFieldEditor
        label={t("annotation.label")}
        availableLanguages={defaultLanguages}
        onSave={(e: any) => {
          setLabel(e.toInternationalString());
        }}
        property={"label"}
        fields={{}}
      />
      {selected === 1 && (
        <FlexContainerRow>
          <Input placeholder={t("annotation.pageUrl")} onChange={(e) => setUrl(e.target.value)} property={"label"} />
          <PaddingComponentMedium />
        </FlexContainerRow>
      )}
      <PaddingComponentMedium />
      <SecondaryButton onClick={() => addNewAnnotationPage(url, label, selected === 0, goBack)}>
        {t("annotation.createPage")}
      </SecondaryButton>
    </LightBox>
  );
};
