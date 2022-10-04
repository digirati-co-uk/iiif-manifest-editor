import { useVault } from "react-iiif-vault";
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
import { useResource } from "@/shell/ResourceEditingContext/ResourceEditingContext";
import { DescriptiveProperties } from "@iiif/presentation-3";
import { MetadataSave } from "@/hooks/useMetadataEditor";
import invariant from "tiny-invariant";
import { useConfig } from "@/shell/ConfigContext/ConfigContext";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { Container } from "./LanguageMapEditor.styles";
import { LanguageFieldEditor } from "../LanguageFieldEditor/LanguageFieldEditor";
import { useRef } from "react";

export const supported: LanguageMapEditorProps["dispatchType"][] = ["label", "summary"];

export function LanguageMapEditor({
  dispatchType,
  languages,
  guidanceReference,
  disableMultiline,
  formElement,
  name,
  id,
}: LanguageMapEditorProps) {
  const resource = useResource<Partial<DescriptiveProperties>>();
  const vault = useVault();
  const inputRef = useRef<HTMLInputElement>(null);
  const { defaultLanguages } = useConfig();

  invariant(
    supported.includes(dispatchType),
    `Unsupported property "${dispatchType}" passed to <LanguageMapEditor /> (${supported.join(", ")})`
  );

  const changeHandler: MetadataSave = (data) => {
    if (formElement) {
      if (inputRef.current) {
        inputRef.current.value = JSON.stringify(data.toInternationalString());
      }
    } else if (resource) {
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
            disableMultiline={disableMultiline}
          />
        </ErrorBoundary>
      )}
      {formElement ? (
        <input ref={inputRef} type="hidden" name={name} id={id} value={JSON.stringify(resource[dispatchType])} />
      ) : null}
    </Container>
  );
}
