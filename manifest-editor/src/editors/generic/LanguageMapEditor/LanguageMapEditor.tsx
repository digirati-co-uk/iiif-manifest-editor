import { useMemo } from "react";
import { useVault } from "react-iiif-vault";
import { useShell } from "../../../context/ShellContext/ShellContext";
import { ErrorBoundary } from "../../../atoms/ErrorBoundary";
import { LanguageFieldEditor } from "../../LanguageFieldEditor";
import { useResource } from "../../../context/ResourceEditingContext/ResourceEditingContext";
import { DescriptiveProperties, Reference } from "@iiif/presentation-3";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { Container } from "./LanguageMapEditor.styles";
import { MetadataSave } from "../../../hooks/useMetadataEditor";
import invariant from "tiny-invariant";

export const supported: LanguageMapEditorProps["dispatchType"][] = ["label", "summary"];

export function LanguageMapEditor({ dispatchType, languages, guidanceReference }: LanguageMapEditorProps) {
  const shellContext = useShell();
  const resource = useResource<Partial<DescriptiveProperties>>();
  const vault = useVault();

  invariant(
    supported.includes(dispatchType),
    `Unsupported property "${dispatchType}" passed to <LanguageMapEditor /> (${supported.join(", ")})`
  );

  const changeHandler: MetadataSave = (data) => {
    if (resource) {
      shellContext.setUnsavedChanges(true);
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
            availableLanguages={languages}
            guidanceReference={guidanceReference}
          />
        </ErrorBoundary>
      )}
    </Container>
  );
}
