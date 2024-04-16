import { Creator, CreatorDefinition } from "@manifest-editor/creator-api";
import { Vault } from "@iiif/helpers/vault";
import { useCallback, useMemo } from "react";
import { useVault } from "react-iiif-vault";
import { toRef } from "@iiif/parser";
import { Reference } from "@iiif/presentation-3";
import { createActionIdentity } from "../helpers";
import { CreatableResource } from "../EditingStack/EditingStack.types";
import { useLayoutActions } from "../Layout/Layout.context";
import { usePreviewVault } from "../PreviewVault/PreviewVault";
import { useApp } from "../AppContext/AppContext";

export function matchBasedOnResource(
  resource: CreatableResource,
  list: CreatorDefinition[],
  options: { vault: Vault }
): CreatorDefinition[] {
  const supported = [];
  if (list.length === 0) {
    return [];
  }
  const parent = toRef(resource.parent);
  const property = resource.property;

  for (const def of list) {
    if (parent && property) {
      if (def.supports.parentTypes) {
        if (!def.supports.parentTypes.includes(parent.type)) {
          continue;
        }
      }
      if (def.supports.parentFields) {
        if (!def.supports.parentFields.includes(property)) {
          continue;
        }
      }

      if (def.supports.parentFieldMap) {
        const type = def.supports.parentFieldMap[parent.type];
        if (!type || !type.includes(property)) {
          continue;
        }
      }

      if (def.supports.disallowPainting && resource.isPainting) {
        continue;
      }

      if (def.supports.custom) {
        const isValid = def.supports.custom({ property, resource: parent, atIndex: resource.index }, options.vault);
        if (!isValid) {
          continue;
        }
      }

      if (!def.supports.initialData && Object.keys(resource.initialData || {}).length !== 0) {
        continue;
      }

      if (def.resourceType !== resource.type) {
        if (!(def.additionalTypes || []).includes(resource.type)) {
          continue;
        }
      }
      supported.push(def);
    }
  }

  return supported;
}

export function useCreator(
  parent: any,
  property: string,
  type: string,
  target?: Reference,
  options?: { isPainting?: boolean; onlyReference?: boolean }
) {
  const vault = useVault();
  const app = useApp();
  const { create, edit } = useLayoutActions();
  const supported = useMemo(
    () => matchBasedOnResource({ type, parent, index: 0, property }, app.layout.creators || [], { vault }),
    [parent, property, app.layout.creators, type, vault]
  );
  const canCreate = parent && supported.length !== 0;

  const wrappedCreate = useCallback(
    (index?: number, initialData?: any) => {
      if (parent) {
        create({ type, parent: toRef(parent), property, index, target, initialData, ...(options || {}) });
      }
    },
    [create, parent, property, type]
  );

  const wrappedEdit = useCallback(
    (resource: any, index?: number) => {
      edit(resource, parent ? { parent: toRef(parent), property, index } : undefined);
    },
    [edit, parent, property]
  );

  const buttonProps = useMemo(() => {
    return {
      "data-action-id": createActionIdentity(type, property, parent),
    };
  }, []);

  return [canCreate, { create: wrappedCreate, edit: wrappedEdit, buttonProps }] as const;
}

export function useInlineCreator() {
  const vault = useVault();
  const previewVault = usePreviewVault();
  const app = useApp();
  return useMemo(() => {
    return new Creator(vault, app.layout.creators || [], previewVault);
  }, [app.layout.creators, vault]);
}
