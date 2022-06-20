import {
  Draft,
  DraftsText,
  DraftTitle,
  DraftTitleEdit,
  DraftTitleEditButton,
  DraftTitleEditInput,
} from "../AppHeader.styles";
import { FormEvent, useState } from "react";
import { flushSync } from "react-dom";
import { useProjectContext } from "../../ProjectContext/ProjectContext";

export function DraftTitleEditor() {
  const { actions } = useProjectContext();
  const [editingTitle, setIsEditingTitle] = useState(false);
  const { current } = useProjectContext();

  return (
    <Draft>
      <DraftsText>Drafts</DraftsText>
      {current ? (
        <>
          {editingTitle ? (
            <DraftTitleEdit
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                const form = new FormData(e.target as any);
                const data = Object.fromEntries(form.entries());
                actions.updateDetails(data as any);
                setIsEditingTitle(false);
              }}
            >
              <DraftTitleEditInput id="project-title" defaultValue={current.name} name="name" />
              <DraftTitleEditButton>Save</DraftTitleEditButton>
            </DraftTitleEdit>
          ) : (
            <DraftTitle
              onClick={() => {
                flushSync(() => {
                  setIsEditingTitle(true);
                });
                document.getElementById("project-title")?.focus();
              }}
            >
              {current.name || "Untitled project"}
            </DraftTitle>
          )}
        </>
      ) : null}
    </Draft>
  );
}
