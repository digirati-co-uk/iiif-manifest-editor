import { LayoutPanel } from "../Layout/Layout.types";
import { BaseEditor, BaseEditorBackButton, BaseEditorCloseButton } from "./BaseEditor";

export const baseEditor: LayoutPanel = {
  id: "@manifest-editor/editor",
  label: "Editor",
  options: { hideHeader: true, tabs: true, minWidth: 400 },
  renderBackAction: ({ backAction, fallback }) => <BaseEditorBackButton backAction={backAction} fallback={fallback} />,
  renderCloseAction: ({ closeAction, fallback }) => (
    <BaseEditorCloseButton closeAction={closeAction} fallback={fallback} />
  ),
  render({ currentTab }) {
    return <BaseEditor currentTab={currentTab} />;
  },
};
