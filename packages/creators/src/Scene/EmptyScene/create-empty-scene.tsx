import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";

export interface CreateEmptyScenePayload {
  label?: InternationalString;
  backgroundColor?: string;
}

export function createEmptyScene(data: CreateEmptyScenePayload, ctx: CreatorFunctionContext) {
  const sceneId = ctx.generateId("scene");
  const page = ctx.embed({
    id: ctx.generateId("annotation-page", { id: sceneId, type: "Scene" } as any),
    type: "AnnotationPage",
    items: [],
  });

  return ctx.embed({
    id: sceneId,
    type: "Scene",
    label: data.label || { en: ["Untitled scene"] },
    backgroundColor: data.backgroundColor || undefined,
    items: [page],
  });
}

export function EmptySceneCreatorForm(props: CreatorContext<CreateEmptyScenePayload>) {
  const [label, setLabel] = useState<InternationalString>({ en: ["Untitled scene"] });
  const [backgroundColor, setBackgroundColor] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    props.runCreate({ label, backgroundColor: backgroundColor || undefined });
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <LanguageFieldEditor
          focusId="scene-label"
          label="Label"
          fields={label}
          onSave={(value: any) => setLabel(value.toInternationalString())}
        />
        <InputContainer $wide>
          <InputLabel htmlFor="scene-background">Background colour</InputLabel>
          <Input
            id="scene-background"
            placeholder="#ffffff"
            value={backgroundColor}
            onChange={(event) => setBackgroundColor(event.target.value)}
          />
        </InputContainer>
        <ActionButton primary type="submit">
          Create scene
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
