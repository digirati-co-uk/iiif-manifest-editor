import { useEditorI18n } from "@manifest-editor/i18n";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useVaultSelector } from "react-iiif-vault";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { evaluateSpecifications, getPropertyPolicy, getTerminologyLabel } from "./SpecificationContext.helpers";
import type { ManifestEditorSpecification, SpecificationPropertyPath } from "./SpecificationContext.types";
import type { Reference } from "@iiif/presentation-3";

const SpecificationReactContext = createContext<ManifestEditorSpecification[]>([]);

export function SpecificationProvider({
  children,
  specifications,
}: {
  children: ReactNode;
  specifications?: ManifestEditorSpecification[];
}) {
  const value = useMemo(() => specifications || [], [specifications]);

  return <SpecificationReactContext.Provider value={value}>{children}</SpecificationReactContext.Provider>;
}

export function useSpecifications() {
  return useContext(SpecificationReactContext);
}

export function useSpecificationReport(rootRef?: Reference) {
  const { resolveMessage, translate, locale, profile } = useEditorI18n();
  const appResource = useAppResource();
  const specifications = useSpecifications();
  const resolvedRootRef = rootRef || appResource;

  return useVaultSelector(
    (_state, vault) => evaluateSpecifications(specifications, vault, resolvedRootRef, { resolveMessage, translate }),
    [specifications, resolvedRootRef.id, resolvedRootRef.type, resolveMessage, translate, locale, profile]
  );
}

export function useSpecificationTerminology() {
  const { resolveMessage, translate, locale, profile } = useEditorI18n();
  const specifications = useSpecifications();

  return useMemo(
    () => ({
      getLabel(
        entityType: string | undefined,
        path: SpecificationPropertyPath | string | undefined,
        fallback?: string
      ) {
        return getTerminologyLabel(specifications, entityType, path, fallback, { resolveMessage, translate });
      },
    }),
    [specifications, resolveMessage, translate, locale, profile]
  );
}

export function useSpecificationPropertyPolicy(
  resourceRef: Reference | null | undefined,
  propertyPath: SpecificationPropertyPath | string
) {
  const specifications = useSpecifications();
  const { resolveMessage, translate, locale, profile } = useEditorI18n();

  return useMemo(
    () => getPropertyPolicy(specifications, resourceRef, propertyPath, { resolveMessage, translate }),
    [
      specifications,
      resolveMessage,
      translate,
      locale,
      profile,
      resourceRef?.id,
      resourceRef?.type,
      JSON.stringify(propertyPath),
    ]
  );
}
