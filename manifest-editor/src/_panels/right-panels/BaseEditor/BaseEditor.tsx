import { useEditingResource, useEditingResourceStack, useEditingStack } from "@/shell/EditingStack/EditingStack";
import invariant from "tiny-invariant";
import { BackIcon } from "@/icons/BackIcon";
import { ModulePanelButton, useSetCustomTitle } from "@/shell/Layout/components/ModularPanel";
import { CloseIcon } from "@/icons/CloseIcon";
import { useLayoutActions, useLayoutState } from "@/shell/Layout/Layout.context";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useApps } from "@/shell/AppContext/AppContext";
import { ResourceDefinition } from "@/shell/Layout/Layout.types";
import { EditableResource } from "@/shell/EditingStack/EditingStack.types";
import { TabPanel } from "@/components/layout/TabPanel";
import { Vault } from "@iiif/vault";
import { EditorDefinition } from "@/shell";

export function BaseEditorBackButton({ fallback, backAction }: any) {
  const stack = useEditingResourceStack();
  const current = useEditingResource();
  const { back, close } = useEditingStack();

  if (stack.length) {
    return (
      <ModulePanelButton onClick={back}>
        <BackIcon />
      </ModulePanelButton>
    );
  }

  if (current) {
    return (
      <ModulePanelButton
        onClick={() => {
          backAction();
          close();
        }}
      >
        <BackIcon />
      </ModulePanelButton>
    );
  }

  return fallback;
}

export function BaseEditorCloseButton({ closeAction, fallback }: any) {
  const stack = useEditingResourceStack();
  const current = useEditingResource();

  if (current || stack.length) {
    return (
      <ModulePanelButton
        onClick={() => {
          closeAction();
        }}
      >
        <CloseIcon />
      </ModulePanelButton>
    );
  }

  return fallback;
}

export function matchBasedOnResource(
  resource: EditableResource,
  list: ResourceDefinition[],
  options: { edit?: boolean; vault: Vault }
): ResourceDefinition | null {
  const filteredList = list.filter((l) => l.resourceType === resource.resource.source.type);

  if (filteredList.length === 0) {
    return null;
  }

  for (const item of filteredList) {
    // Check for a match in order.
    const sortKeys: string[] = [];
    const sortKeyFallbacks: Record<string, EditorDefinition> = {};
    // 1. Filter out the
    const editors = (item.editors || []).filter((editor) => {
      if (editor.supports.sortKey) {
        if (sortKeys.includes(editor.supports.sortKey)) {
          return false;
        }
        if (editor.supports.sortFallback) {
          sortKeyFallbacks[editor.supports.sortKey] = editor;
        }
      }

      // Does this editor support the input resource.
      if (options.edit && !editor.supports.edit) {
        return false;
      }

      if (editor.supports.custom ? editor.supports.custom(resource, options.vault) === false : false) {
        return false;
      }

      // @todo more logic here, including "custom" supports check.

      if (editor.supports.sortKey) {
        sortKeys.push(editor.supports.sortKey);
      }

      return true;
    });

    const missingKeys = Object.keys(sortKeyFallbacks);
    for (const missingKey of missingKeys) {
      if (
        !sortKeys.includes(missingKey) &&
        sortKeyFallbacks[missingKey] &&
        !editors.includes(sortKeyFallbacks[missingKey])
      ) {
        editors.push(sortKeyFallbacks[missingKey]);
      }
    }

    if (editors.length) {
      return {
        ...item,
        editors,
      };
    }
  }

  return null;
}

export function BaseEditor({ currentTab = 0 }: { currentTab?: number }) {
  const { apps, currentApp } = useApps();
  const resource = useEditingResource();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  const vault = useVault();
  const { change } = useLayoutActions();
  const set = useSetCustomTitle();

  const match = useMemo(() => {
    if (!resource) {
      return null;
    }

    const editors = selectedApp?.layout.editors || [];
    const resources = selectedApp?.layout.resources || [];
    const mappedResources: ResourceDefinition[] = resources.map((resource) => {
      if (typeof resource === "string") {
        return {
          id: "@default/" + resource,
          label: resource,
          resourceType: resource,
          auto: true,
          editors: editors.filter((e) => e.supports.resourceTypes.includes(resource)),
        };
      }
      return resource;
    });

    return matchBasedOnResource(resource, mappedResources, { edit: true, vault });
  }, [resource, selectedApp]);

  useEffect(() => {
    set(match?.label || "");
  }, [match]);

  // Problems to solve:
  //  - Subscribing to updates to the reference
  //    - Keeping track of changes to the item, by checking it's index
  //    - If the items change - ensure we have the same index by doing an equality check on the reference?

  if (!resource || !match) {
    return null;
  }

  return (
    <>
      <TabPanel
        key={resource.resource.source?.id}
        menu={match?.editors.map((editor) => {
          return {
            label: editor.label,
            renderComponent: () => editor.component(),
          };
        })}
        selected={currentTab}
        switchPanel={(p) => change("@manifest-editor/editor", { currentTab: p })}
      />
    </>
  );
}
