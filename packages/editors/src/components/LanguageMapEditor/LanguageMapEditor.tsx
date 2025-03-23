import { useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { ErrorBoundary } from "@manifest-editor/ui/atoms/ErrorBoundary";
import { useResource, useConfig } from "@manifest-editor/shell";
import { DescriptiveProperties } from "@iiif/presentation-3";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { Container } from "./LanguageMapEditor.styles";
import { LanguageFieldEditor } from "../LanguageFieldEditor/LanguageFieldEditor";
import { useRef } from "react";
import { MetadataSave } from "../../hooks/useMetadataEditor";

export const supported: LanguageMapEditorProps["dispatchType"][] = ["label", "summary"];

export function LanguageMapEditor({
  dispatchType,
  guidanceReference,
  disableMultiline,
  formElement,
  name,
  id,
  disallowHTML,
}: LanguageMapEditorProps) {
  const resource = useResource<Partial<DescriptiveProperties>>();
  const vault = useVault();
  const inputRef = useRef<HTMLInputElement>(null);

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
            guidanceReference={guidanceReference}
            disableMultiline={disableMultiline}
            disallowHTML={disallowHTML}
          />
        </ErrorBoundary>
      )}
      {formElement ? (
        <input ref={inputRef} type="hidden" name={name} id={id} value={JSON.stringify(resource[dispatchType])} />
      ) : null}
    </Container>
  );
}
