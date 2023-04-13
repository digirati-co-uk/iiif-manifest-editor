import { LayoutPanel } from "@/shell/Layout/Layout.types";
import React from "react";
import { BaseEditor, BaseEditorBackButton, BaseEditorCloseButton } from "./BaseEditor";

export const baseEditor: LayoutPanel = {
  id: "@manifest-editor/editor",
  label: "Editor",
  options: { hideHeader: true, tabs: true },
  renderBackAction: ({ backAction, fallback }) => <BaseEditorBackButton backAction={backAction} fallback={fallback} />,
  renderCloseAction: ({ closeAction, fallback }) => (
    <BaseEditorCloseButton closeAction={closeAction} fallback={fallback} />
  ),
  render() {
    return <BaseEditor />;
  },
};
