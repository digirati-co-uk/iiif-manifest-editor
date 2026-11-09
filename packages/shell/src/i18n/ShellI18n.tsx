import { useMemo, useRef, type ReactNode } from "react";
import { EditorI18nProvider, useEditorI18n, useOptionalEditorI18nInstance } from "@manifest-editor/i18n";
import { createEditorI18n, type PresetLanguagePolicy } from "@manifest-editor/i18n/core";
import { useConfig } from "../ConfigContext/ConfigContext";

import { mergeLocalisation, type ShellLocalisation } from "./types";
export * from "./types";

export function ShellI18nBoundary({
  children,
  localisation,
  preset,
}: {
  children: ReactNode;
  localisation?: ShellLocalisation;
  preset?: ShellLocalisation;
}) {
  const { uiI18n } = useConfig();
  const inherited = useOptionalEditorI18nInstance();
  const parent = useEditorI18n();
  const previous = useRef<ReturnType<typeof createEditorI18n> | null>(null);
  const policyKey = parent.availableLocales.map((item) => item.id).join("|") + ";" + parent.availableProfiles.join("|");
  const configKey = JSON.stringify(uiI18n);
  const override = !!(uiI18n || localisation || preset);
  const instance = useMemo(() => {
    if (inherited && !override) return inherited;
    const last = previous.current?.getSnapshot();
    const hostPolicy: PresetLanguagePolicy[] = inherited
      ? [
          {
            availableLocales: parent.availableLocales.map((locale) => locale.id),
            availableProfiles: parent.availableProfiles,
          },
        ]
      : [];
    const options = mergeLocalisation(preset, localisation);
    const next = createEditorI18n({
      ...options,
      // The inherited host selection is authoritative, including the first SSR render.
      locale: inherited ? undefined : options?.locale,
      profile: inherited ? undefined : options?.profile,
      locales: options?.locales || (inherited ? parent.availableLocales : undefined),
      config: { ...preset?.config, ...localisation?.config, ...uiI18n },
      policies: [...hostPolicy, ...(preset?.policies || []), ...(localisation?.policies || [])],
      presets: [...(preset?.presets || []), ...(localisation?.presets || [])],
      requiredNamespaces: [
        ...new Set([
          "shell",
          "editor-api",
          ...(preset?.requiredNamespaces || []),
          ...(localisation?.requiredNamespaces || []),
          ...(uiI18n?.requiredNamespaces || []),
        ]),
      ],
      registrations: [...(preset?.registrations || []), ...(localisation?.registrations || [])],
      persistedLocale: inherited ? parent.locale : last?.locale,
      persistedProfile: inherited ? parent.profile : last?.profile,
    });
    previous.current = next;
    return next;
    // Selection changes use the existing engine. Only resource/configuration changes replace it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inherited, override, configKey, localisation, preset, policyKey]);
  // Keep one provider position even when a preset adds/removes an override.
  // The inherited instance is retained; both controlled actions forward through
  // the parent context (never through its raw instance setters).
  const snapshot = instance.getSnapshot();
  const locale = inherited
    ? snapshot.availableLocales.some((item) => item.id === parent.locale)
      ? parent.locale
      : snapshot.locale
    : undefined;
  const profile = inherited
    ? snapshot.availableProfiles.includes(parent.profile)
      ? parent.profile
      : snapshot.profile
    : undefined;
  return (
    <EditorI18nProvider
      instance={instance}
      locale={locale}
      profile={profile}
      onLocaleChange={
        inherited
          ? (value) => {
              if (!snapshot.availableLocales.some((item) => item.id === value))
                throw new RangeError(`Unavailable shell locale: ${value}`);
              return parent.setLocale(value);
            }
          : undefined
      }
      onProfileChange={
        inherited
          ? (value) => {
              if (!snapshot.availableProfiles.includes(value))
                throw new RangeError(`Unavailable shell profile: ${value}`);
              return parent.setProfile(value);
            }
          : undefined
      }
    >
      {children}
    </EditorI18nProvider>
  );
}
