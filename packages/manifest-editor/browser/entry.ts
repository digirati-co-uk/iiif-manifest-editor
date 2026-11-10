export { ManifestEditor, type ManifestEditorProps } from "../src/ManifestEditor";
export * as shell from "@manifest-editor/shell";
export * as components from "@manifest-editor/components";
export * as creators from "@manifest-editor/creators";
export * as creatorApi from "@manifest-editor/creator-api";
export * as editorApi from "@manifest-editor/editor-api";
export * as manifestPreset from "@manifest-editor/manifest-preset";
export * as collectionPreset from "@manifest-editor/collection-preset";
export * as exhibitionPreset from "@manifest-editor/exhibition-preset";
export * as vault from "react-iiif-vault";
export { Vault } from "@iiif/helpers";

// Shared host modules: never bundle a second public translation context.
export * as i18n from "@manifest-editor/i18n";
export * as i18nCore from "@manifest-editor/i18n/core";

export const runtimeApiVersion = 2;
