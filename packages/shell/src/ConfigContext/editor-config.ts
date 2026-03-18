import type { EditorInstance } from "@manifest-editor/editor-api";
import type { EditorDefinition } from "../Layout/Layout.types";
import type { Config, EditorConfig } from "./ConfigContext";

type RootResource = { id: string; type: string } | null | undefined;

export function getEditorConfigResourceType(
  resourceType?: string,
  options: {
    resourceId?: string;
    rootResource?: RootResource;
  } = {},
) {
  if (
    options.resourceId &&
    options.rootResource &&
    options.resourceId !== options.rootResource.id &&
    options.rootResource.type === "Collection" &&
    resourceType === "Collection"
  ) {
    return "EmbeddedCollection";
  }

  return resourceType;
}

export function getEditorConfigForResource(
  editorConfig: Config["editorConfig"],
  options: {
    resourceId?: string;
    resourceType?: string;
    rootResource?: RootResource;
  },
): EditorConfig {
  const resourceType = getEditorConfigResourceType(options.resourceType, {
    resourceId: options.resourceId,
    rootResource: options.rootResource,
  });

  if (resourceType) {
    return (editorConfig as any)[resourceType] || editorConfig.All || {};
  }

  return editorConfig.All || {};
}

export function editorMatchesConfiguredFields(
  editor: EditorDefinition,
  config: EditorConfig,
) {
  if (!config.fields?.length) {
    return true;
  }

  if (!editor.supports.properties.length) {
    return true;
  }

  return editor.supports.properties.some((property) =>
    config.fields?.includes(property),
  );
}

export function applyFieldsToEditorInstance<T extends EditorInstance<any>>(
  editor: T,
  config: EditorConfig,
) {
  if (!config.fields?.length) {
    return editor;
  }

  const visibleFields = new Set(config.fields);
  const allKnownFields = new Set<string>([
    ...(editor.required as string[]),
    ...(editor.recommended as string[]),
    ...(editor.optional as string[]),
    ...editor.notAllowed,
    ...(editor.allowed as string[]),
  ]);

  const hiddenFields = [...allKnownFields].filter(
    (field) => !visibleFields.has(field),
  );

  editor.required = (editor.required as string[]).filter((field) =>
    visibleFields.has(field),
  ) as any;
  editor.recommended = (editor.recommended as string[]).filter((field) =>
    visibleFields.has(field),
  ) as any;
  editor.optional = (editor.optional as string[]).filter((field) =>
    visibleFields.has(field),
  ) as any;
  editor.allowed = (editor.allowed as string[]).filter((field) =>
    visibleFields.has(field),
  ) as any;
  editor.notAllowed = [...new Set([...editor.notAllowed, ...hiddenFields])];

  return editor;
}
