import { LayoutPanel } from "@/shell/Layout/Layout.types";
import React from "react";
import { BaseEditor, BaseEditorBackButton, BaseEditorCloseButton } from "./BaseEditor";

export const baseEditor: LayoutPanel = {
  id: "@manifest-editor/editor",
  label: "Editor",
  options: { hideHeader: true, tabs: true },
  renderBackAction: ({ backAction, fallback, mini }) => (
    <BaseEditorBackButton mini={mini} backAction={backAction} fallback={fallback} />
  ),
  renderCloseAction: ({ closeAction, fallback, mini }) => (
    <BaseEditorCloseButton mini={mini} closeAction={closeAction} fallback={fallback} />
  ),
  render({ currentTab }) {
    return <BaseEditor currentTab={currentTab} />;
  },
};
