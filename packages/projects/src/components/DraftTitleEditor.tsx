import { FormEvent, useState } from "react";
import { flushSync } from "react-dom";
import styled from "styled-components";
import { useProjectContext } from "../ProjectContext";
import { SmallButton } from "@manifest-editor/ui/atoms/Button";

export const Draft = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  padding: 0.28em;
  padding-left: 0.5em;
  align-items: center;
  overflow: hidden;
`;

export const DraftsText = styled.div`
  color: #828282;
  padding-right: 1em;
`;

export const DraftTitleEdit = styled.form`
  margin: 0;
  padding: 0;
  display: flex;
  flex: 1;
`;

export const DraftTitleEditInput = styled.input`
  font-size: 1em;
  flex: 1;
  border: 1px solid #999;
  padding: 0.2em;
  margin: -0.2em 0;
`;

export const DraftTitleEditButton = styled(SmallButton as any)`
  font-size: 1em;
  display: inline-block;
`;

export const DraftTitle = styled.div`
  color: #333;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export function DraftTitleEditor() {
  const { actions, current } = useProjectContext();
  const [editingTitle, setIsEditingTitle] = useState(false);

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
