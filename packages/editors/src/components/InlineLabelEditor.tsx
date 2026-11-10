import { documentValuesEqual, finishVaultEditSessions } from "@manifest-editor/editor-api";
import { useVault } from "react-iiif-vault";
import { useTranslations } from "@manifest-editor/i18n";
import type { InternationalString, Reference, SpecificResource } from "@iiif/presentation-3";
import { ActionButton } from "@manifest-editor/components";
import { useGenericEditor } from "@manifest-editor/shell";
import { useMemo, useRef, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { LanguageFieldEditor } from "./LanguageFieldEditor/LanguageFieldEditor";

export function InlineLabelEditor(props: {
  resource: Reference<any> | SpecificResource | undefined;
  ctx?: {
    parent?: Reference;
    parentProperty?: string;
    index?: number;
    allowNull?: boolean;
  };
  className?: string;
  actionLabel?: string;
  onSubmit?: (value: InternationalString) => void;
  onCancel?: () => void;
  hideCancel?: boolean;
}) {
  const commonT = useTranslations("common");
  const historyT = useTranslations("shell");
  const vault = useVault();
  const editor = useGenericEditor(props.resource, props.ctx);
  const originalValue = useMemo(() => editor.descriptive.label.get(), [editor.ref().id]);
  const [draft, setDraft] = useState(originalValue);
  const draftRef = useRef(draft);
  const [conflict, setConflict] = useState(false);
  const cancelRef = useRef<boolean>(false);
  useEffect(() => {
    draftRef.current = originalValue;
    setDraft(originalValue);
    cancelRef.current = false;
    setConflict(false);
  }, [editor.ref().id]);
  const onCancel = () => {
    cancelRef.current = true;
    if (props.onCancel) props.onCancel();
    else props.onSubmit?.(originalValue);
  };

  return (
    <form
      className={twMerge("flex gap-2 items-center justify-center w-full max-w-xl", props.className)}
      onSubmit={(e) => {
        e.preventDefault();
        finishVaultEditSessions(vault);
        if (!documentValuesEqual(editor.descriptive.label.get(), originalValue)) {
          setConflict(true);
          return;
        }
        editor.descriptive.label.set(draftRef.current);
        props.onSubmit?.(draftRef.current);
      }}
    >
      <LanguageFieldEditor
        singleValue
        autoFocus
        className="mb-0 w-full"
        label=""
        fields={draft}
        onSave={(e) => {
          if (cancelRef.current) return;
          draftRef.current = e.toInternationalString();
          setDraft(draftRef.current);
        }}
        disableMultiline={true}
        disallowHTML={true}
      />
      {conflict && <span role="alert">{historyT("history.conflict")}</span>}
      <ActionButton primary type="submit">
        {props.actionLabel || commonT("actions.save")}
      </ActionButton>
      {!props.hideCancel ? (
        <ActionButton type="button" onClick={onCancel}>
          {commonT("actions.cancel")}
        </ActionButton>
      ) : null}
    </form>
  );
}
