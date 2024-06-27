import { EditorState, RichUtils } from "draft-js";
import { FormEvent, SetStateAction } from "react";

export function useCreateLink(
  editorState: EditorState,
  updateEditorState: (s: SetStateAction<EditorState>) => void,
  afterSubmit?: () => void
) {
  function updateLink(newLink: string) {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity("LINK", "MUTABLE", { url: newLink });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    // Apply entity
    const nextEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

    // Apply selection
    updateEditorState(RichUtils.toggleLink(nextEditorState, nextEditorState.getSelection(), entityKey));
  }

  function removeLink() {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      updateEditorState(RichUtils.toggleLink(editorState, selection, null));
    }
  }

  return {
    onSubmit(e: FormEvent<HTMLFormElement>) {
      const form = e.target as HTMLFormElement;
      // Prevent default.
      e.preventDefault();

      const data = new FormData(form);
      const object = Object.fromEntries(data.entries()) as { link: string };

      const action = ((e.nativeEvent as SubmitEvent).submitter as any)?.value;

      if (action === "remove") {
        removeLink();
      } else {
        updateLink(object.link);
      }

      // Reset form.
      form.reset();

      afterSubmit && afterSubmit();
    },
  };
}
