"use client";

/**
 * Wires `LanguageMenu` to the editor i18n runtime. One icon button controls
 * language and wording. Every language offers every allowed wording profile as
 * a variant, so the caret appears whenever the deployment allows more than one profile.
 */

import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { useEffect, useState } from "react";
import { I18nProvider as ReactAriaI18nProvider } from "react-aria-components";
import { LanguageMenu, type LanguageMenuProps } from "./LanguageMenu";

export function HeaderLanguageMenu({ variant = "light" }: Pick<LanguageMenuProps, "variant">) {
  const { locale, profile, direction, availableLocales, availableProfiles, select, loading, error } = useEditorI18n();
  const t = useTranslations("web");
  const [requesting, setRequesting] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  useEffect(() => setRequestFailed(false), [locale, profile]);

  // Translators are stable across locale/profile changes; resolve these labels each render.
  const variants =
    availableProfiles.length > 1 ? availableProfiles.map((id) => ({ id, label: t(`settings.${id}`) })) : undefined;
  const options = availableLocales.map((item) => ({ id: item.id, name: item.nativeName, variants }));

  const run = (change: Promise<unknown>) => {
    setRequesting(true);
    setRequestFailed(false);
    void change.catch(() => setRequestFailed(true)).finally(() => setRequesting(false));
  };

  return (
    <ReactAriaI18nProvider locale={locale}>
      <div lang={locale} dir={direction} className="relative flex items-center">
        <LanguageMenu
          locale={locale}
          activeVariant={profile}
          options={options}
          loading={loading || requesting}
          variant={variant}
          direction={direction}
          onSelect={(next) => {
            run(select({ locale: next.locale, ...(next.variant ? { profile: next.variant } : {}) }));
          }}
          labels={{
            interfaceLanguage: t("settings.interfaceLanguage"),
            availableLanguages: t("settings.availableLanguages"),
            loading: t("browser.loading"),
            searchLanguages: t("settings.searchLanguages"),
            noLanguages: t("settings.noLanguages"),
            moreOptions: (language) => t("settings.moreOptions", { language }),
          }}
        />
        <output className="sr-only">{error || requestFailed ? t("settings.changeFailed") : ""}</output>
      </div>
    </ReactAriaI18nProvider>
  );
}
