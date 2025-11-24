import { useVault } from "react-iiif-vault";
import { PaddingComponentSmall } from "@/atoms/PaddingComponent";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { Input, InputLabel } from "@/editors/Input";
import { useAnnotationPage } from "@/hooks/useAnnotationPage";
import { useConfig } from "@/shell";

export const AnnotationPage: React.FC<{ id: string }> = ({ id }) => {
  const annotationPage = useAnnotationPage({ id: id });
  const vault = useVault();
  const { defaultLanguages } = useConfig();

  if (!annotationPage) {
    return <></>;
  }

  return (
    <>
      <LanguageFieldEditor
        key={annotationPage.id}
        label={"label"}
        fields={annotationPage.label}
        availableLanguages={defaultLanguages}
        onSave={(e: any) => {
          vault.modifyEntityField(
            { id: annotationPage.id, type: "AnnotationPage" },
            "label",
            e.toInternationalString(),
          );
        }}
        property={"label"}
      />
      <InputLabel>
        identifier
        <Input key={annotationPage.id} value={annotationPage.id} disabled={true} property={"behavior"} />
      </InputLabel>
      <InputLabel>
        behavior
        <Input
          key={annotationPage.id}
          value={annotationPage.behavior}
          onChange={(e: any) => {
            vault.modifyEntityField({ id: annotationPage.id, type: "AnnotationPage" }, "behavior", e.target.value);
          }}
          property={"behavior"}
        />
      </InputLabel>
      {/* <InputLabel>
        format
        <Input
          key={annotationPage.id}
          value={annotationPage.format}
          onChange={(e: any) => {
            vault.modifyEntityField({ id: annotationPage.id, type: "AnnotationPage" }, "format", e.target.value);
          }}
          property={"format"}
        />
      </InputLabel> */}
      {/* <InputLabel>
        language
        <Input
          key={annotationPage.id}
          value={annotationPage.language}
          onChange={(e: any) => {
            vault.modifyEntityField({ id: annotationPage.id, type: "AnnotationPage" }, "language", e.target.value);
          }}
          property={"language"}
        />
      </InputLabel> */}
      <PaddingComponentSmall />
    </>
  );
};
