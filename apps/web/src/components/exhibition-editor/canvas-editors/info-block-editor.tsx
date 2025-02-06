import { ActionButton, HTMLEditor } from "@manifest-editor/components";
import {} from "@manifest-editor/creators";
import { Input, InputContainer, Label } from "@manifest-editor/editors";
import { type CanvasEditorDefinition, useCreator, useGenericEditor, useInlineCreator } from "@manifest-editor/shell";
import { Dropdown } from "@manifest-editor/ui/atoms/Dropdown";
import { useState } from "react";
import { Button } from "react-aria-components";
import {
  AnnotationContext,
  LocaleString,
  type TextualContentStrategy,
  useAnnotation,
  useCanvas,
  useVaultSelector,
} from "react-iiif-vault";

export const infoBlockEditor: CanvasEditorDefinition = {
  id: "info-block-editor",
  label: "info Block Editor",
  component: (strategy) => <InfoBlockEditor strategy={strategy as TextualContentStrategy} />,
  supports: {
    strategy: (strategy, resource, vault) => {
      if (strategy.type !== "textual-content") {
        return false;
      }
      return true;
    },
  },
};

export function InfoBlockEditor(props: { strategy: TextualContentStrategy }) {
  const canvas = useCanvas();
  const annotationPage = useVaultSelector((_, vault) =>
    // biome-ignore lint/style/noNonNullAssertion: Should always be present.
    vault.get(canvas?.items[0]!)
  );
  const longSummaries = useVaultSelector((_, vault) =>
    canvas?.annotations[0] ? vault.get(canvas?.annotations[0]!) : null
  );

  // creator.create(definition, payload);

  return (
    <div className="overflow-y-auto bg-white shadow">
      <div className="mb-12">
        {annotationPage.items.map((annotation, key) => {
          return (
            <AnnotationContext key={annotation.id + key} annotation={annotation.id}>
              <AnnotationEditor />
            </AnnotationContext>
          );
        })}
      </div>

      {longSummaries ? (
        <>
          <h2 className="text-2xl font-bold px-4 border-t border-gray-200 pt-4 mb-4">Long Summaries</h2>
          <p className="my-4 px-4">
            Long summaries are used to provide more detailed information about the canvas. They appear when the user
            clicks "read more" in the exhibition.
          </p>
          {longSummaries.items.map((annotation, key) => {
            return (
              <AnnotationContext key={annotation.id + key} annotation={annotation.id}>
                <AnnotationEditor />
              </AnnotationContext>
            );
          })}
        </>
      ) : null}
    </div>
  );
}

function AnnotationEditor() {
  const annotation = useAnnotation();
  const creator = useInlineCreator();
  const bodies = annotation?.body || [];
  const editor = useGenericEditor(annotation);

  if (!annotation) {
    return null;
  }

  return (
    <div>
      {bodies.map((body, n) => {
        return (
          <AnnotationBodyEditor key={n} resourceId={body.id} onRemove={() => editor.annotation.body.deleteAtIndex(n)} />
        );
      })}

      <div className="p-4">
        <ActionButton
          primary
          onPress={() => {
            creator.create(
              "@manifest-editor/html-body-creator",
              { language: "en", value: "" },
              {
                targetType: "ContentResource",
                parent: {
                  property: "body",
                  resource: {
                    id: annotation.id,
                    type: "Annotation",
                  },
                },
                initialData: {},
              }
            );
          }}
        >
          Add new annotation
        </ActionButton>
      </div>
    </div>
  );
}

function AnnotationBodyEditor({ resourceId, onRemove }: { resourceId: string; onRemove: () => void }) {
  const editor = useGenericEditor({
    id: resourceId as string,
    type: "ContentResource",
  });
  const { language, value } = editor.descriptive;

  return (
    <div className="p-4 hover:bg-me-100/40 focus-within:bg-me-100/40">
      <div className="flex gap-4 mb-4 items-center">
        <Label>Language</Label>
        <div className="w-32">
          <Input value={language.get() || ""} onChange={(newValue) => language.set(newValue.target.value as any)} />
        </div>
        <ActionButton
          onPress={() => {
            if (confirm("Do you want to remove this body?")) {
              onRemove();
            }
          }}
        >
          Remove
        </ActionButton>
      </div>
      <div className="prose-xl">
        <HTMLEditor value={value.get() || ""} onChange={(newValue) => value.set(newValue)} />
      </div>
    </div>
  );
}
