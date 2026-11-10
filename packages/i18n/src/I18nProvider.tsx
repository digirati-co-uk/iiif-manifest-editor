"use client";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider, Trans, useTranslation } from "react-i18next";
import { createEditorI18n, engineFor } from "./runtime";
import { createCatalogContract, createMessageReference } from "./messages";
import type { EditorI18n, EditorI18nOptions, EditorI18nSnapshot, MessageReference, Translate } from "./types";

const Context = createContext<{ runtime: EditorI18n; actions: EditorI18n } | null>(null);
export interface EditorI18nProviderProps extends EditorI18nOptions {
  readonly children?: ReactNode;
  /** Keep this instance stable; recreate explicitly when catalog configuration changes. */
  readonly instance?: EditorI18n;
  readonly onLocaleChange?: (locale: string) => void;
  readonly onProfileChange?: (profile: string) => void;
  readonly onError?: (error: Error) => void;
}
export function EditorI18nProvider(props: EditorI18nProviderProps): ReactElement {
  const { locale, profile, onError, onLocaleChange, onProfileChange } = props;
  const [owned] = useState(() => props.instance || createEditorI18n(props));
  const runtime = props.instance || owned;
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  useEffect(() => {
    // One request handles controlled locale/profile together, including initial loaders.
    void runtime
      .select({
        ...(locale !== undefined ? { locale: locale } : {}),
        ...(profile !== undefined ? { profile: profile } : {}),
      })
      .catch((error: Error) => onError?.(error));
  }, [runtime, locale, profile, onError]);
  const value = useMemo<EditorI18n>(() => {
    const select: EditorI18n["select"] = async (request) => {
      // Notify both fields together, and propagate asynchronous host rejection to the caller.
      await Promise.all([
        ...(request.locale !== undefined ? [Promise.resolve().then(() => onLocaleChange?.(request.locale!))] : []),
        ...(request.profile !== undefined ? [Promise.resolve().then(() => onProfileChange?.(request.profile!))] : []),
      ]);
      const uncontrolled = {
        ...(locale === undefined && request.locale !== undefined ? { locale: request.locale } : {}),
        ...(profile === undefined && request.profile !== undefined ? { profile: request.profile } : {}),
      };
      if (Object.keys(uncontrolled).length) await runtime.select(uncontrolled);
    };
    return {
      ...runtime,
      select,
      setLocale: (requestedLocale) => select({ locale: requestedLocale }),
      setProfile: (requestedProfile) => select({ profile: requestedProfile }),
    };
  }, [runtime, locale, profile, onLocaleChange, onProfileChange]);
  return (
    <Context.Provider value={{ runtime, actions: value }}>
      <I18nextProvider i18n={engineFor(runtime)}>
        <div lang={state.locale} dir={state.direction} data-editor-i18n="" style={{ display: "contents" }}>
          {props.children}
        </div>
      </I18nextProvider>
    </Context.Provider>
  );
}
/** Stable standalone English fallback, initialized only when actually used. */
function useRuntime(): EditorI18n {
  const inherited = useContext(Context);
  const [standalone] = useState(() => (inherited ? null : createEditorI18n()));
  return inherited?.runtime || standalone!;
}
export type EditorI18nContext = EditorI18nSnapshot & EditorI18n;
/** Integration boundaries can inherit an actual provider without creating a standalone fallback. */
export function useOptionalEditorI18nInstance(): EditorI18n | undefined {
  return useContext(Context)?.runtime;
}
export function useEditorI18n(): EditorI18nContext {
  const runtime = useRuntime();
  const inherited = useContext(Context);
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const actions = inherited?.actions || runtime;
  return useMemo(() => ({ ...actions, ...state }), [actions, state]);
}
export function useTranslations(namespace: string): Translate {
  const runtime = useRuntime();
  useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  useTranslation(namespace, { i18n: engineFor(runtime), useSuspense: false });
  return useMemo(() => runtime.translate(namespace), [runtime, namespace]);
}
export interface EditorTransProps {
  readonly reference: MessageReference;
  readonly fallback?: string;
  readonly components?: Readonly<Record<string, ReactElement>>;
}
/** Full sentences with validated named tags; catalogs cannot set component attributes. */
export function EditorTrans({ reference, fallback, components }: EditorTransProps): ReactElement {
  const runtime = useRuntime();
  useTranslations(reference.namespace);
  const safeReference = createMessageReference(reference.namespace, reference.key, {
    ...(reference.values ? { values: reference.values } : {}),
    ...(reference.defaultValue !== undefined ? { defaultValue: reference.defaultValue } : {}),
  });
  const defaults = safeReference.defaultValue ?? fallback;
  if (defaults !== undefined)
    createCatalogContract({ message: defaults }, { richText: ["message"], allowEmpty: ["message"] });
  // Trans can parse an absent key as its implicit fallback. Identifiers are never markup.
  if (/[<>]/.test(safeReference.key)) return <>{runtime.resolveMessage(safeReference, fallback)}</>;
  const richComponents: Record<string, ReactElement> = {};
  for (const [tag, component] of Object.entries(components || {})) {
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(tag) || tag.toLowerCase().startsWith("i18nvalue"))
      throw new TypeError("Rich components must use non-reserved named tags");
    richComponents[tag] = component;
  }
  const replacements: Record<string, string> = {};
  for (const [name, value] of Object.entries(safeReference.values || {})) {
    const tag = `i18nvalue${Object.keys(replacements).length}`;
    replacements[name] = `<${tag}/>`;
    // Only trusted marker tags enter Trans's parser. User values are React text nodes.
    richComponents[tag] = <>{value === null ? "" : String(value)}</>;
  }
  return (
    <Trans
      i18nKey={safeReference.key}
      ns={safeReference.namespace}
      i18n={engineFor(runtime)}
      defaults={defaults}
      count={typeof safeReference.values?.count === "number" ? safeReference.values.count : undefined}
      tOptions={{ replace: replacements, interpolation: { escapeValue: false, skipOnVariables: true } }}
      components={richComponents}
    />
  );
}
/** Scope a portal's DOM language/direction while retaining its React provider context. */
export function EditorI18nScope({ children }: { readonly children?: ReactNode }): ReactElement {
  const { locale, direction } = useEditorI18n();
  return (
    <div lang={locale} dir={direction} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
