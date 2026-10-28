"use client";

import { createEditorI18n, type EditorI18n } from "@manifest-editor/i18n/core";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { useEffect, useState, type ReactNode } from "react";
import { serializeWebUiPreferences, webUiPolicy, type WebUiPolicy, type WebUiPreferences } from "./policy";

export function createWebI18n(preferences: WebUiPreferences = {}, policy: WebUiPolicy = webUiPolicy): EditorI18n {
  return createEditorI18n({
    ...policy,
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
    persistedLocale: preferences.locale,
    persistedProfile: preferences.profile,
  });
}

function synchronizeWebPreferences(runtime: EditorI18n, initialPreferences: WebUiPreferences): () => void {
  const root = document.documentElement;
  const original = { locale: root.lang, direction: root.getAttribute("dir") };
  let previous = runtime.getSnapshot();
  let preferences = { ...initialPreferences };
  const synchronize = () => {
    const snapshot = runtime.getSnapshot();
    if (snapshot.loading || snapshot.error) return;
    root.lang = snapshot.locale;
    root.dir = snapshot.direction;
    const localeChanged = snapshot.locale !== previous.locale;
    const profileChanged = snapshot.profile !== previous.profile;
    if (localeChanged || profileChanged) {
      preferences = {
        ...preferences,
        ...(localeChanged ? { locale: snapshot.locale } : {}),
        ...(profileChanged ? { profile: snapshot.profile } : {}),
      };
      try {
        document.cookie = serializeWebUiPreferences(preferences, location.protocol === "https:");
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
  children,
}: {
  preferences?: WebUiPreferences;
  policy?: WebUiPolicy;
  children: ReactNode;
}) {
  const [{ runtime, initialPreferences }] = useState(() => ({
    runtime: createWebI18n(preferences, policy),
    initialPreferences: { ...preferences },
  }));
  useEffect(() => synchronizeWebPreferences(runtime, initialPreferences), [runtime, initialPreferences]);
  return <EditorI18nProvider instance={runtime}>{children}</EditorI18nProvider>;
}
