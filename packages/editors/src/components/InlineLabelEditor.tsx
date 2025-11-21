import type { InternationalString, Reference, SpecificResource } from "@iiif/presentation-3";
import { ActionButton } from "@manifest-editor/components";
import { useGenericEditor } from "@manifest-editor/shell";
import { useMemo, useRef } from "react";
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
  const editor = useGenericEditor(props.resource, props.ctx);
  const originalValue = useMemo(() => editor.descriptive.label.get(), [props.resource?.id]);
  const cancelRef = useRef<boolean>(false);
  const onCancel =
    props.onCancel ||
    (() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      editor.descriptive.label.set(originalValue);
      props.onSubmit?.(originalValue);
      cancelRef.current = true;
    });
  const timeoutRef = useRef<any>(null);

  return (
    <form
      className={twMerge("flex gap-2 items-center justify-center w-full max-w-xl", props.className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Hack to avoid stale state.
        timeoutRef.current = setTimeout(() => {
          props.onSubmit?.(editor.descriptive.label.get());
        }, 300);
      }}
    >
      <LanguageFieldEditor
        singleValue
        autoFocus
        className="mb-0 w-full"
        label=""
        fields={editor.descriptive.label.get()}
        onSave={(e) => {
          if (cancelRef.current) return;
          editor.descriptive.label.set(e.toInternationalString());
        }}
        disableMultiline={true}
        disallowHTML={true}
      />
      <ActionButton primary type="submit">
        {props.actionLabel || "Save"}
      </ActionButton>
      {!props.hideCancel ? (
        <ActionButton type="button" onClick={onCancel}>
          Cancel
        </ActionButton>
      ) : null}
    </form>
  );
}
