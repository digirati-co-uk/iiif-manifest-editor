import { ActionButton } from "@manifest-editor/components";
import {
  useConfig,
  useGenericEditor,
  useInlineCreator,
} from "@manifest-editor/shell";
import { useAnnotation } from "react-iiif-vault";
import { useMemo } from "react";
import { useVault } from "react-iiif-vault";
import { AnnotationBodyEditor } from "./AnnotationBodyEditor";

type EditableBodyEntry = {
  ref: { id: string; type: "ContentResource" };
  bodyIndex: number;
  choice?: { id: string; type: "ContentResource" };
  choiceItemIndex?: number;
};

export function HTMLAnnotationEditor({ className }: { className?: string }) {
  const annotation = useAnnotation();
  const vault = useVault();
  const creator = useInlineCreator();
  const bodies = annotation?.body || [];
  const editor = useGenericEditor(annotation);
  const {
    i18n: { defaultLanguage, advancedLanguageMode },
  } = useConfig();
  const editableBodies = useMemo(
    () => getEditableBodyEntries(bodies, vault),
    [bodies, vault],
  );
  const choiceParent =
    editableBodies.find((entry) => entry.choice)?.choice ||
    getFirstChoiceRef(bodies, vault);

  if (!annotation) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {editableBodies.map((body, n) => {
        return (
          <AnnotationBodyEditor
            editorClassName={className}
            defaultLanguage={defaultLanguage}
            showLanguage={advancedLanguageMode}
            key={n}
            resourceId={body.ref.id}
            onRemove={() => {
              if (body.choice && typeof body.choiceItemIndex === "number") {
                const choice = vault.get(
                  body.choice as any,
                  { skipSelfReturn: false } as any,
                ) as any;
                const items = Array.isArray(choice?.items) ? choice.items : [];
                vault.modifyEntityField(
                  body.choice as any,
                  "items",
                  items.filter(
                    (_item: unknown, index: number) =>
                      index !== body.choiceItemIndex,
                  ),
                );
                return;
              }

              editor.annotation.body.deleteAtIndex(body.bodyIndex);
            }}
          />
        );
      })}

      {advancedLanguageMode ? (
        <div className="">
          <ActionButton
            primary
            onPress={() => {
              creator.create(
                "@manifest-editor/html-body-creator",
                { language: "en", body: "" },
                {
                  targetType: "ContentResource",
                  parent: {
                    property: choiceParent ? "items" : "body",
                    resource: choiceParent || {
                      id: annotation.id,
                      type: "Annotation",
                    },
                  },
                  initialData: {},
                },
              );
            }}
          >
            Add new translation
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

function getEditableBodyEntries(
  bodies: any[],
  vault: any,
): EditableBodyEntry[] {
  return bodies.flatMap((body, bodyIndex) =>
    getEditableBodyEntry(body, bodyIndex, vault),
  );
}

function getEditableBodyEntry(
  body: any,
  bodyIndex: number,
  vault: any,
  choice?: EditableBodyEntry["choice"],
): EditableBodyEntry[] {
  const resource = resolveResource(body, vault);
  const ref = getResourceRef(body, resource);
  if (!resource || !ref) {
    return [];
  }

  if (resource.type === "Choice") {
    return toArray(resource.items).flatMap((item, choiceItemIndex) =>
      getEditableBodyEntry(item, bodyIndex, vault, ref).map((entry) => ({
        ...entry,
        choiceItemIndex,
      })),
    );
  }

  return resource.type === "TextualBody" || resource.type === "Text"
    ? [{ ref, bodyIndex, choice }]
    : [];
}

function getFirstChoiceRef(bodies: any[], vault: any) {
  for (const body of bodies) {
    const resource = resolveResource(body, vault);
    const ref = getResourceRef(body, resource);
    if (resource?.type === "Choice" && ref) {
      return ref;
    }
  }
  return null;
}

function getResourceRef(
  input: any,
  resource: any,
): { id: string; type: "ContentResource" } | null {
  const id =
    typeof input?.id === "string"
      ? input.id
      : typeof resource?.id === "string"
        ? resource.id
        : "";
  return id ? { id, type: "ContentResource" } : null;
}

function resolveResource(resource: any, vault: any) {
  if (!resource?.id || resource.value || resource.items) {
    return resource;
  }

  return (
    vault.get(resource as any, { skipSelfReturn: false } as any) || resource
  );
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "undefined" || value === null) return [];
  return [value];
}
