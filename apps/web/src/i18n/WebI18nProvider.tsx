"use client";

import { createEditorI18n, type EditorI18n } from "@manifest-editor/i18n/core";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createWebResourceOptions } from "./resources";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { serializeWebUiPreferences, webUiPolicy, type WebUiPolicy, type WebUiPreferences } from "./policy";
import { WebResourceContext } from "./WebResources";
import type { WebResourcePreload } from "./preload";

export function createWebI18n(
  preferences: WebUiPreferences = {},
  policy: WebUiPolicy = webUiPolicy,
  initialResources?: WebResourcePreload
): EditorI18n {
  return createEditorI18n({
    ...policy,
    ...createWebResourceOptions(initialResources).ui,
    persistedLocale: preferences.locale,
    persistedProfile: preferences.profile,
  });
}

function synchronizeWebPreferences(runtime: EditorI18n, preferences: { current: WebUiPreferences }): () => void {
  const root = document.documentElement;
  const original = { locale: root.lang, direction: root.getAttribute("dir") };
  let previous = runtime.getSnapshot();

  const synchronize = () => {
    const snapshot = runtime.getSnapshot();
    if (snapshot.loading || snapshot.error) return;
    root.lang = snapshot.locale;
    root.dir = snapshot.direction;
    const localeChanged = snapshot.locale !== previous.locale;
    const profileChanged = snapshot.profile !== previous.profile;
    if (localeChanged || profileChanged) {
      preferences.current = {
        ...preferences.current,
        ...(localeChanged ? { locale: snapshot.locale } : {}),
        ...(profileChanged ? { profile: snapshot.profile } : {}),
      };
      try {
        document.cookie = serializeWebUiPreferences(preferences.current, location.protocol === "https:");
      } catch {
        // A blocked cookie does not prevent an in-session UI choice.
      }
    }
    previous = snapshot;
  };
  synchronize();
  const unsubscribe = runtime.subscribe(synchronize);
  return () => {
    unsubscribe();
    root.lang = original.locale;
    if (original.direction === null) root.removeAttribute("dir");
    else root.setAttribute("dir", original.direction);
  };
}

/** One full-page host instance. Route/preset/locale changes never key the editor tree. */
export function WebI18nProvider({
  preferences = {},
  policy = webUiPolicy,
  initialResources,
  children,
}: {
  preferences?: WebUiPreferences;
  policy?: WebUiPolicy;
  initialResources?: WebResourcePreload;
  children: ReactNode;
}) {
  const [savedPreferences] = useState(() => ({ current: { ...preferences } }));
  const resources = useMemo(() => createWebResourceOptions(initialResources), [initialResources]);
  const previousRuntime = useRef<EditorI18n | null>(null);
  const runtime = useMemo(() => {
    const previous = previousRuntime.current?.getSnapshot();
    // A changed policy may invalidate only one of the independently persisted choices.
    savedPreferences.current = {
      ...(policy.config.availableLocales.includes(savedPreferences.current.locale ?? "")
        ? { locale: savedPreferences.current.locale }
        : {}),
      ...(policy.config.availableProfiles.includes(savedPreferences.current.profile ?? "")
        ? { profile: savedPreferences.current.profile }
        : {}),
    };
    const next = createWebI18n(
      previous ? { locale: previous.locale, profile: previous.profile } : savedPreferences.current,
      policy,
      initialResources
    );
    previousRuntime.current = next;
    return next;
  }, [policy, savedPreferences, initialResources]);
  useEffect(() => synchronizeWebPreferences(runtime, savedPreferences), [runtime, savedPreferences]);
  return (
    <WebResourceContext.Provider value={resources}>
      <EditorI18nProvider instance={runtime}>{children}</EditorI18nProvider>
    </WebResourceContext.Provider>
  );
}
