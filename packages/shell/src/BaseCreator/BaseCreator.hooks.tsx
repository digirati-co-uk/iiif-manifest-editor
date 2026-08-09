import { toRef } from "@iiif/parser";
import type { Vault4 } from "@iiif/helpers/vault-4";
import type { Reference } from "@iiif/presentation-3";
import { Creator, matchBasedOnResource } from "@manifest-editor/creator-api";
import { useCallback, useMemo } from "react";
import { useVault } from "react-iiif-vault";
import { useApp } from "../AppContext/AppContext";
import { useConfig } from "../ConfigContext/ConfigContext";
import { createActionIdentity } from "../helpers";
import { useLayoutActions } from "../Layout/Layout.context";
import { usePreviewVault } from "../PreviewVault/PreviewVault";

export function useCreator(
  parent: any,
  property: string,
  type: string,
  target?: Reference,
  options?: { isPainting?: boolean; onlyReference?: boolean },
) {
  const vault = useVault() as unknown as Vault4;
  const app = useApp();
  const { create, edit } = useLayoutActions();
  const supported = useMemo(
    () => matchBasedOnResource({ type, parent, index: 0, property }, app.layout.creators || [], { vault: vault as any }),
    [parent, property, app.layout.creators, type, vault],
  );
  const canCreate = parent && supported.length !== 0;

  const wrappedCreate = useCallback(
    (index?: number, initialData?: any) => {
      if (parent) {
        return create({
          type,
          parent: toRef(parent),
          property,
          index,
          target,
          initialData,
          ...(options || {}),
        });
      }
    },
    [create, parent, property, type, options, target],
  );

  const wrappedFilteredCreate = useCallback(
    (filter: string, index?: number, initialData?: any) => {
      if (parent) {
        return create({
          type,
          filter,
          parent: toRef(parent),
          property,
          index,
          target,
          initialData,
          ...(options || {}),
        });
      }
    },
    [create, parent, property, type, options, target],
  );

  const wrappedEdit = useCallback(
    (resource: any, index?: number) => {
      edit(resource, parent ? { parent: toRef(parent), property, index } : undefined);
    },
    [edit, parent, property],
  );

  const wrappedCreator = useCallback(
    (initialCreator: string, initialData?: any) => {
      if (parent) {
        return create({
          type,
          initialCreator,
          parent: toRef(parent),
          property,
          target,
          initialData,
          ...(options || {}),
        });
      }
    },
    [type, property, parent, target, create, options],
  );

  const buttonProps = useMemo(() => {
    return {
      "data-action-id": createActionIdentity(type, property, parent),
    };
  }, [type, property, parent]);

  return [
    canCreate,
    {
      create: wrappedCreate,
      edit: wrappedEdit,
      createFiltered: wrappedFilteredCreate,
      creator: wrappedCreator,
      buttonProps,
    },
  ] as const;
}

export function useInlineCreator() {
  const vault = useVault() as unknown as Vault4;
  const previewVault = usePreviewVault();
  const app = useApp();
  const config = useConfig();
  return useMemo(() => {
    return new Creator(vault as any, app.layout.creators || [], previewVault as any, config.creators);
  }, [app.layout.creators, config.creators, previewVault, vault]);
}
