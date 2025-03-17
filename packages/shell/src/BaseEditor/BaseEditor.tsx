import { useMemo, useEffect, ReactNode, useContext } from "react";
import { Vault } from "@iiif/helpers";
import { BackIcon } from "@manifest-editor/ui/icons/BackIcon";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { useVault, ResourceReactContext } from "react-iiif-vault";
import { useEditingResource, useEditingResourceStack, useEditingStack } from "../EditingStack/EditingStack";
import { ModulePanelButton, useSetCustomTitle } from "../Layout/components/ModularPanel";
import { EditableResource } from "../EditingStack/EditingStack.types";
import { EditorDefinition, ResourceDefinition } from "../Layout/Layout.types";
import { useLayoutActions } from "../Layout/Layout.context";
import { useApp } from "../AppContext/AppContext";
import { SidebarTabs } from "@manifest-editor/components";
import { EditorConfig, useConfig } from "../ConfigContext/ConfigContext";

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
  config: EditorConfig
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
  const vault = useVault();
  const { change } = useLayoutActions();
  const set = useSetCustomTitle();
  const { editorConfig } = useConfig();
  const resourceConfig: EditorConfig =
    (resource?.resource.source?.type
      ? (editorConfig as any)[resource?.resource.source?.type as any]
      : editorConfig.All) || {};

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
  });

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
      return wrap(<div className="w-full">{first.component(resourceConfig)}</div>);
    }
  }

  return wrap(
    <SidebarTabs
      key={resource.resource.source?.id}
      menuId={resource.resource.source.id}
      menu={(match?.editors || []).map((editor, key) => {
        return {
          id: editor.id + key,
          label: editor.label,
          renderComponent: () => editor.component(resourceConfig),
        };
      })}
      selectedKey={currentTab}
      onSelectionChange={(p: any) => change("@manifest-editor/editor", { currentTab: p })}
    />
  );
}
