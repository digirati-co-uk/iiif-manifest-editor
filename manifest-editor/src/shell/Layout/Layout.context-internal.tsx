import { memo, ReactNode, useContext, useMemo, useReducer, useState } from "react";
import {
  LayoutActionsReactContext,
  LayoutPropsReactContext,
  LayoutStateReactContext,
} from "@/shell/Layout/Layout.context";
import {
  CreatableResource,
  EditableResource,
  getDefaultLayoutState,
  LayoutProviderProps,
  layoutReducer,
  PinnablePanelActions,
  useEditingStack,
  usePanelActions,
} from "@/shell";
import invariant from "tiny-invariant";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { isSpecificResource } from "@iiif/parser";

function parse(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any): any {
  if (typeof args === "string") {
    return { id: args, state: _state };
  }
  return args;
}

export function useLayoutProvider() {
  const available = useContext(LayoutPropsReactContext);
  const actions = useContext(LayoutActionsReactContext);
  const state = useContext(LayoutStateReactContext);

  return useMemo(() => {
    return { actions, state, ...available };

    // The actions have a fully stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, state]);
}

export const LayoutProvider = memo(function LayoutProvider(props: { children: ReactNode }) {
  const [available, setAvailable] = useState<LayoutProviderProps & { loading?: true }>({
    loading: true,
    centerPanels: [],
    leftPanels: [],
    rightPanels: [],
  });
  const [state, dispatch] = useReducer(layoutReducer, undefined, getDefaultLayoutState);
  const actions = {
    setAvailable,
    centerPanel: usePanelActions("centerPanel", dispatch),
    leftPanel: usePanelActions("leftPanel", dispatch),
    rightPanel: usePanelActions("rightPanel", dispatch),
    pinnedRightPanel: usePanelActions("pinnedRightPanel", dispatch) as PinnablePanelActions,
    editingStack: useEditingStack(),
  };

  function find(id: any) {
    const right = available.rightPanels.find((r) => r.id === id);
    if (right) {
      return [right, actions.rightPanel, actions.pinnedRightPanel] as const;
    }

    const center = available.centerPanels.find((r) => r.id === id);
    if (center) {
      return [center, actions.centerPanel] as const;
    }

    const left = available.leftPanels.find((r) => r.id === id);
    if (left) {
      return [left, actions.leftPanel] as const;
    }

    invariant(false, `Was not able to find panel with id "${id}"`);
  }

  function open(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any): void {
    const { id, state, stacked } = parse(args, _state);
    const [found, actions, pinnable] = find(id);

    if (pinnable && found.options?.openPinned) {
      pinnable.pin({ id, state: { ...(found.defaultState || {}), ...(state || {}) } });
    } else {
      actions.open({
        id,
        state: { ...(found.defaultState || {}), ...(state || {}) },
        stacked,
      });
    }
  }

  function stack(args: string | { id: string; state?: any }, _state?: any): void {
    const { id, state } = parse(args, _state);
    const [found, actions] = find(id);
    actions.open({
      id,
      state: { ...(found.defaultState || {}), ...(state || {}) },
      stacked: true,
    });
  }

  function change(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any): void {
    const { id, state, stacked } = parse(args, _state);
    const [found, actions] = find(id);
    actions.change({
      id,
      state: { ...(found.defaultState || {}), ...(state || {}) },
      stacked,
    });
  }

  function close(args: string | { id: string; state?: any }, _state?: any): void {
    const { id } = parse(args, _state);
    const [, actions] = find(id);
    actions.close();
  }

  function toggle(args: string | { id: string; state?: any }, _state?: any): void {
    const { id } = parse(args, _state);
    const [, actions] = find(id);
    actions.toggle();
  }

  function edit(
    resource: Reference | SpecificResource,
    context: Omit<EditableResource, "resource"> = {},
    { reset, property, stacked }: { reset?: boolean; property?: string; stacked?: boolean | undefined } = {}
  ) {
    const toEdit: EditableResource = {
      resource: isSpecificResource(resource)
        ? resource
        : {
            type: "SpecificResource",
            source: resource,
          },
      ...context,
    };

    actions.editingStack.edit(toEdit, reset);

    if (available.rightPanels.find((e) => e.id === "@manifest-editor/editor")) {
      actions.rightPanel.open({
        id: "@manifest-editor/editor",
        stacked: stacked !== false,
        state: { property },
        unique: true,
      });
    }
  }

  function create(resource: CreatableResource) {
    actions.editingStack.create(resource, {});
    if (available.rightPanels.find((e) => e.id === "@manifest-editor/creator")) {
      actions.rightPanel.open({
        id: "@manifest-editor/creator",
        stacked: true,
        unique: true,
        state: resource,
      });
    }
  }

  const otherActions = {
    open,
    change,
    close,
    toggle,
    stack,
    edit,
    create,
  };

  return (
    <LayoutPropsReactContext.Provider value={available}>
      <LayoutActionsReactContext.Provider value={useMemo(() => ({ ...actions, ...otherActions }), [available])}>
        <LayoutStateReactContext.Provider value={state}>{props.children}</LayoutStateReactContext.Provider>
      </LayoutActionsReactContext.Provider>
    </LayoutPropsReactContext.Provider>
  );
});
