import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useVaultSelector } from "react-iiif-vault";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import {
  evaluateSpecifications,
  getPropertyPolicy,
  getTerminologyLabel,
} from "./SpecificationContext.helpers";
import type {
  ManifestEditorSpecification,
  SpecificationPropertyPath,
} from "./SpecificationContext.types";
import type { Reference } from "@iiif/presentation-3";
import type { Vault4 } from "@iiif/helpers/vault-4";

const SpecificationReactContext = createContext<ManifestEditorSpecification[]>(
  [],
);

export function SpecificationProvider({
  children,
  specifications,
}: {
  children: ReactNode;
  specifications?: ManifestEditorSpecification[];
}) {
  const value = useMemo(() => specifications || [], [specifications]);

  return (
    <SpecificationReactContext.Provider value={value}>
      {children}
    </SpecificationReactContext.Provider>
  );
}

export function useSpecifications() {
  return useContext(SpecificationReactContext);
}

export function useSpecificationReport(rootRef?: Reference) {
  const appResource = useAppResource();
  const specifications = useSpecifications();
  const resolvedRootRef = rootRef || appResource;

  return useVaultSelector(
    (_state, vault) =>
      evaluateSpecifications(specifications, vault as unknown as Vault4, resolvedRootRef),
    [specifications, resolvedRootRef.id, resolvedRootRef.type],
  );
}

export function useSpecificationTerminology() {
  const specifications = useSpecifications();

  return useMemo(
    () => ({
      getLabel(
        entityType: string | undefined,
        path: SpecificationPropertyPath | string | undefined,
        fallback?: string,
      ) {
        return getTerminologyLabel(specifications, entityType, path, fallback);
      },
    }),
    [specifications],
  );
}

export function useSpecificationPropertyPolicy(
  resourceRef: Reference | null | undefined,
  propertyPath: SpecificationPropertyPath | string,
) {
  const specifications = useSpecifications();

  return useMemo(
    () => getPropertyPolicy(specifications, resourceRef, propertyPath),
    [
      specifications,
      resourceRef?.id,
      resourceRef?.type,
      JSON.stringify(propertyPath),
    ],
  );
}
