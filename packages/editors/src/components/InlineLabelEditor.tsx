import type { InternationalString, Reference, SpecificResource } from "@iiif/presentation-3";
import { ActionButton } from "@manifest-editor/components";
import { useGenericEditor } from "@manifest-editor/shell";
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
}) {
  const editor = useGenericEditor(props.resource, props.ctx);

  return (
    <form
      className={twMerge("flex gap-2 items-center justify-center w-full max-w-xl", props.className)}
      onSubmit={(e) => {
        e.preventDefault();
        // Hack to avoid stale state.
        setTimeout(() => {
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
        onSave={(e) => editor.descriptive.label.set(e.toInternationalString())}
        disableMultiline={true}
        disallowHTML={true}
      />
      <ActionButton primary type="submit">
        {props.actionLabel || "Finish editing"}
      </ActionButton>
      {props.onCancel ? (
        <ActionButton type="button" onClick={props.onCancel}>
          Cancel
        </ActionButton>
      ) : null}
    </form>
  );
}
