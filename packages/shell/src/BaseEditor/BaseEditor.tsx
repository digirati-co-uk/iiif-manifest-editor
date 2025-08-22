import type { Vault } from "@iiif/helpers";
import { SidebarTabs } from "@manifest-editor/components";
import { BackIcon } from "@manifest-editor/ui/icons/BackIcon";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { type ReactNode, useContext, useEffect, useMemo } from "react";
import { ResourceReactContext, useVault } from "react-iiif-vault";
import { useApp } from "../AppContext/AppContext";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { type EditorConfig, useConfig } from "../ConfigContext/ConfigContext";
import { useEditingResource, useEditingResourceStack, useEditingStack } from "../EditingStack/EditingStack";
import type { EditableResource } from "../EditingStack/EditingStack.types";
import { useLayoutActions } from "../Layout/Layout.context";
import type { EditorDefinition, ResourceDefinition } from "../Layout/Layout.types";
import { ModulePanelButton, useSetCustomTitle } from "../Layout/components/ModularPanel";

export function BaseEditorBackButton({ fallback, backAction }: any) {
  const stack = useEditingResourceStack();
  const { back } = useEditingStack();

  if (stack.length) {
    return (
      <ModulePanelButton onClick={back}>
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

export function editBasedOnResource(
  resource: EditableResource,
  list: ResourceDefinition[],
  options: { edit?: boolean; vault: Vault },
  config: EditorConfig,
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
      if (config.hideTabs && config.hideTabs.includes(editor.id)) {
        return false;
      }
      if (config.onlyTabs && !config.onlyTabs.includes(editor.id)) {
        return false;
      }
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
        !editors.includes(sortKeyFallbacks[missingKey]!)
      ) {
        editors.push(sortKeyFallbacks[missingKey]!);
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

export function BaseEditor({ currentTab = undefined }: { currentTab?: string }) {
  const resource = useEditingResource();
  const currentResourceContext = useContext(ResourceReactContext);
  const app = useApp();
  const rootResource = useAppResource();
  const vault = useVault();
  const { change } = useLayoutActions();
  const set = useSetCustomTitle();
  const { editorConfig } = useConfig();
  const resourceId = resource?.resource.source?.id;
  let resourceType = resource?.resource.source?.type;
  // Could use this is for later.
  const isNested = resourceId !== rootResource.id;
  if (resourceId && isNested && rootResource.type === "Collection" && resourceType === "Collection") {
    resourceType = "EmbeddedCollection";
  }

  const resourceConfig: EditorConfig = (resourceType ? (editorConfig as any)[resourceType] : editorConfig.All) || {};

  const newResourceContext = useMemo(() => {
    const newCtx = { ...currentResourceContext };
    const id = resource?.resource.source.id;
    const type = resource?.resource.source.type;
    const mapping = {
      Collection: "collection",
      Manifest: "manifest",
      Range: "range",
      Canvas: "canvas",
      Annotation: "annotation",
      AnnotationPage: "annotationPage",
    };

    if (type && (mapping as any)[type]) {
      (newCtx as any)[(mapping as any)[type]] = id;
    }
    return newCtx;
  }, [resource, currentResourceContext]);

  function wrap(children: ReactNode) {
    if (!resource) {
      return children;
    }

    return <ResourceReactContext.Provider value={newResourceContext}>{children}</ResourceReactContext.Provider>;
  }

  const match = useMemo(() => {
    if (!resource) {
      return null;
    }

    const editors = app.layout.editors || [];
    const resources = app.layout.resources || [];
    const mappedResources: ResourceDefinition[] = resources.map((resource: string | ResourceDefinition) => {
      if (typeof resource === "string") {
        return {
          id: "@default/" + resource,
          label: resource,
          resourceType: resource,
          auto: true,
          editors: editors.filter((e: any) => e.supports.resourceTypes.includes(resource)),
        };
      }
      return resource;
    });

    return editBasedOnResource(resource, mappedResources, { edit: true, vault }, resourceConfig);
  }, [resource, app]);

  useEffect(() => {
    set(match?.label || "");
  }, [match]);

  useEffect(() => {
    const availableKeys = match?.editors.map((editor) => editor.id) || [];
    const currentKey = availableKeys.find((key) => key === currentTab);
    if (!currentKey) {
      change("@manifest-editor/editor", { currentTab: availableKeys[0] });
    }
  }, [match?.editors, currentTab, change]);

  // Problems to solve:
  //  - Subscribing to updates to the reference
  //    - Keeping track of changes to the item, by checking it's index
  //    - If the items change - ensure we have the same index by doing an equality check on the reference?

  if (!resource || !match) {
    return null;
  }

  if (resourceConfig.singleTab) {
    const first = (match?.editors || []).find((editor) => editor.id === resourceConfig.singleTab);
    if (first) {
      return wrap(
        <div key={resource.resource.source?.id} className="w-full">
          {first.component(resourceConfig)}
        </div>,
      );
    }
  }

  return wrap(
    <SidebarTabs
      isNested={isNested}
      rootResource={rootResource}
      key={resource.resource.source?.id}
      menuId={resource.resource.source.id}
      menu={(match?.editors || []).map((editor, key) => {
        return {
          id: editor.id,
          label: editor.label,
          renderComponent: () => editor.component(resourceConfig),
        };
      })}
      selectedKey={currentTab}
      onSelectionChange={(p: any) => {
        change("@manifest-editor/editor", { currentTab: p });
      }}
    />,
  );
}
