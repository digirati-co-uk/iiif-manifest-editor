// Compile-only consumer contract: imports use public source entry points/types.
import type { ManifestEditorProps, ShellLocalisation, ShellUiI18nConfig } from "../src/index";
import type { BrowserRuntimeOptions, RuntimeHost } from "../src/remote";
import type { EditorI18nOptions } from "@manifest-editor/i18n/core";

type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
export type LocalisationContract = Assert<Equal<ManifestEditorProps["localisation"], ShellLocalisation | undefined>>;
export type RuntimeOptionsContract = Assert<Equal<ShellLocalisation, EditorI18nOptions>>;
export type BrowserContextContract = Assert<Equal<BrowserRuntimeOptions["I18n"], RuntimeHost["@manifest-editor/i18n"]>>;
export const serialisable: ShellUiI18nConfig = { defaultLocale: "nl", availableLocales: ["nl"] };
export const invalidConfig: ShellUiI18nConfig = {
  // @ts-expect-error Executable loaders/resources do not belong in persisted uiI18n.
  registrations: [],
};
