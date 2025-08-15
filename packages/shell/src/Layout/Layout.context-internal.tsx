import { isSpecificResource } from "@iiif/parser";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import type { CreatableResource } from "@manifest-editor/creator-api";
import { type ReactNode, memo, useMemo, useReducer } from "react";
import invariant from "tiny-invariant";
import { useApp } from "../AppContext/AppContext";
import { useEditingStack } from "../EditingStack/EditingStack";
import type { EditableResource } from "../EditingStack/EditingStack.types";
import { LayoutActionsReactContext, LayoutStateReactContext } from "./Layout.context";
import { usePanelActions } from "./Layout.hooks";
import { getDefaultLayoutState, layoutReducer } from "./Layout.reducer";
import type { PinnablePanelActions } from "./Layout.types";
import { useEmitter } from "../hooks/use-event";

function parse(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any): any {
  if (typeof args === "string") {
    return { id: args, state: _state };
  }
  return args;
}

export const LayoutProvider = memo(function LayoutProvider(props: { children: ReactNode }) {
  const app = useApp();
  const emitter = useEmitter();
  const available = app.layout;

  const [state, dispatch] = useReducer(layoutReducer, undefined, getDefaultLayoutState);
  const actions = {
    centerPanel: usePanelActions("centerPanel", dispatch),
    leftPanel: usePanelActions("leftPanel", dispatch),
    rightPanel: usePanelActions("rightPanel", dispatch),
    pinnedRightPanel: usePanelActions("pinnedRightPanel", dispatch) as PinnablePanelActions,
    modal: usePanelActions("modal", dispatch),
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
      pinnable.pin({
        id,
        state: { ...(found.defaultState || {}), ...(state || {}) },
      });
    } else {
      const openData = {
        id,
        state: { ...(found.defaultState || {}), ...(state || {}) },
        stacked,
      };

      emitter.emit("layout.open", openData);
      actions.open(openData);
    }
  }

  function stack(args: string | { id: string; state?: any }, _state?: any): void {
    const { id, state } = parse(args, _state);
    const [found, actions] = find(id);

    const openData = {
      id,
      state: { ...(found.defaultState || {}), ...(state || {}) },
      stacked: true,
    };

    emitter.emit("layout.open", openData);
    actions.open(openData);
  }

  function change(args: string | { id: string; state?: any; stacked?: boolean }, _state?: any): void {
    const { id, state, stacked } = parse(args, _state);
    const [found, actions] = find(id);
    const changeData = {
      id,
      state: { ...(found.defaultState || {}), ...(state || {}) },
      stacked,
    };

    emitter.emit("layout.change", changeData);
    actions.change(changeData);
  }

  function close(args: string | { id: string; state?: any }, _state?: any): void {
    const { id } = parse(args, _state);
    const [, actions] = find(id);

    emitter.emit("layout.close", { id });
    actions.close();
  }

  function toggle(args: string | { id: string; state?: any }, _state?: any): void {
    const { id } = parse(args, _state);
    const [, actions] = find(id);

    emitter.emit("layout.toggle", { id });
    actions.toggle();
  }

  function edit(
    resource: Reference | SpecificResource,
    context: Omit<EditableResource, "resource"> = {},
    {
      reset,
      property,
      stacked,
    }: {
      reset?: boolean;
      property?: string;
      stacked?: boolean | undefined;
    } = {}
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

    emitter.emit("layout.edit", toEdit);
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
    emitter.emit("layout.create", resource);
    if (available.modals?.find((e) => e.id === "@manifest-editor/creator")) {
      actions.modal.open({
        id: "@manifest-editor/creator",
        stacked: true,
        unique: true,
        state: resource,
      });
    } else if (available.rightPanels.find((e) => e.id === "@manifest-editor/creator")) {
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
    <LayoutActionsReactContext.Provider
      // biome-ignore lint/correctness/useExhaustiveDependencies: actions do not change
      value={useMemo(() => ({ ...actions, ...otherActions }), [available])}
    >
      <LayoutStateReactContext.Provider value={state}>{props.children}</LayoutStateReactContext.Provider>
    </LayoutActionsReactContext.Provider>
  );
});
