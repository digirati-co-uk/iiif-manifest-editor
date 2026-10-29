import { useTranslations } from "@manifest-editor/i18n";
import { FormEvent, useRef, useState } from "react";
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
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  text-align: start;
  cursor: pointer;
  color: #333;
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export function DraftTitleEditor() {
  const t = useTranslations("projects");
  const common = useTranslations("common");
  const input = useRef<HTMLInputElement>(null);
  const { actions, current } = useProjectContext();
  const [editingTitle, setIsEditingTitle] = useState(false);

  return (
    <Draft>
      <DraftsText>{t("draft.list")}</DraftsText>
      {current ? (
        <>
          {editingTitle ? (
            <DraftTitleEdit
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = new FormData(e.target as any);
                const data = Object.fromEntries(form.entries());
                actions.updateDetails(data as any);
                setIsEditingTitle(false);
              }}
            >
              <DraftTitleEditInput ref={input} aria-label={t("draft.title")} defaultValue={current.name} name="name" />
              <DraftTitleEditButton type="submit">{common("actions.save")}</DraftTitleEditButton>
            </DraftTitleEdit>
          ) : (
            <DraftTitle
              as="button"
              type="button"
              aria-label={t("draft.edit", { name: current.name || t("draft.untitledProject") })}
              onClick={() => {
                flushSync(() => {
                  setIsEditingTitle(true);
                });
                input.current?.focus();
              }}
            >
              {current.name || t("draft.untitledProject")}
            </DraftTitle>
          )}
        </>
      ) : null}
    </Draft>
  );
}
