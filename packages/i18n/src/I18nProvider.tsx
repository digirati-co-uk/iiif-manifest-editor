"use client";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider, Trans, useTranslation } from "react-i18next";
import { createEditorI18n, engineFor } from "./runtime";
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
  const value = useMemo<EditorI18n>(
    () => ({
      ...runtime,
      setLocale: async (requestedLocale) => {
        onLocaleChange?.(requestedLocale);
        if (locale === undefined) await runtime.setLocale(requestedLocale);
      },
      setProfile: async (requestedProfile) => {
        onProfileChange?.(requestedProfile);
        if (profile === undefined) await runtime.setProfile(requestedProfile);
      },
    }),
    [runtime, locale, profile, onLocaleChange, onProfileChange]
  );
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
  return (
    <Trans
      i18nKey={reference.key}
      ns={reference.namespace}
      i18n={engineFor(runtime)}
      defaults={reference.defaultValue ?? fallback}
      values={reference.values}
      count={typeof reference.values?.count === "number" ? reference.values.count : undefined}
      components={components}
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
