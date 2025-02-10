import { toRef } from "@iiif/parser";
import type { Reference } from "@iiif/presentation-3";
import { Creator, matchBasedOnResource } from "@manifest-editor/creator-api";
import { useCallback, useMemo } from "react";
import { useVault } from "react-iiif-vault";
import { useApp } from "../AppContext/AppContext";
import { useLayoutActions } from "../Layout/Layout.context";
import { usePreviewVault } from "../PreviewVault/PreviewVault";
import { createActionIdentity } from "../helpers";

export function useCreator(
  parent: any,
  property: string,
  type: string,
  target?: Reference,
  options?: { isPainting?: boolean; onlyReference?: boolean },
) {
  const vault = useVault();
  const app = useApp();
  const { create, edit } = useLayoutActions();
  const supported = useMemo(
    () =>
      matchBasedOnResource(
        { type, parent, index: 0, property },
        app.layout.creators || [],
        { vault },
      ),
    [parent, property, app.layout.creators, type, vault],
  );
  const canCreate = parent && supported.length !== 0;

  const wrappedCreate = useCallback(
    (index?: number, initialData?: any) => {
      if (parent) {
        create({
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
    [create, parent, property, type],
  );

  const wrappedFilteredCreate = useCallback(
    (filter: string, index?: number, initialData?: any) => {
      if (parent) {
        create({
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
    [create, parent, property, type],
  );

  const wrappedEdit = useCallback(
    (resource: any, index?: number) => {
      edit(
        resource,
        parent ? { parent: toRef(parent), property, index } : undefined,
      );
    },
    [edit, parent, property],
  );

  const buttonProps = useMemo(() => {
    return {
      "data-action-id": createActionIdentity(type, property, parent),
    };
  }, []);

  return [
    canCreate,
    {
      create: wrappedCreate,
      edit: wrappedEdit,
      createFiltered: wrappedFilteredCreate,
      buttonProps,
    },
  ] as const;
}

export function useInlineCreator() {
  const vault = useVault();
  const previewVault = usePreviewVault();
  const app = useApp();
  return useMemo(() => {
    return new Creator(vault, app.layout.creators || [], previewVault);
  }, [app.layout.creators, vault]);
}
