import { useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../../atoms/ErrorBoundary";
import { LanguageFieldEditor } from "../../LanguageFieldEditor";
import { useResource } from "../../../shell/ResourceEditingContext/ResourceEditingContext";
import { DescriptiveProperties } from "@iiif/presentation-3";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { Container } from "./LanguageMapEditor.styles";
import { MetadataSave } from "../../../hooks/useMetadataEditor";
import invariant from "tiny-invariant";
import { useConfig } from "../../../shell/ConfigContext/ConfigContext";

export const supported: LanguageMapEditorProps["dispatchType"][] = ["label", "summary"];

export function LanguageMapEditor({ dispatchType, languages, guidanceReference }: LanguageMapEditorProps) {
  const resource = useResource<Partial<DescriptiveProperties>>();
  const vault = useVault();
  const { defaultLanguages } = useConfig();

  invariant(
    supported.includes(dispatchType),
    `Unsupported property "${dispatchType}" passed to <LanguageMapEditor /> (${supported.join(", ")})`
  );

  const changeHandler: MetadataSave = (data) => {
    if (resource) {
      vault.modifyEntityField(resource, dispatchType, data.toInternationalString());
    }
  };

  return (
    <Container key={resource?.id}>
      {resource && (
        <ErrorBoundary>
          <LanguageFieldEditor
            label={dispatchType}
            fields={resource[dispatchType] || {}}
            onSave={changeHandler}
            availableLanguages={languages || defaultLanguages}
            guidanceReference={guidanceReference}
          />
        </ErrorBoundary>
      )}
    </Container>
  );
}
