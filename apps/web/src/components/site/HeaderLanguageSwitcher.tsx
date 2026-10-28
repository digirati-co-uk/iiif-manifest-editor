"use client";

import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { LanguageSwitcher, type LanguageSwitcherProps } from "./LanguageSwitcher";
import { I18nProvider as ReactAriaI18nProvider } from "react-aria-components";
import { useEffect, useState } from "react";

export function HeaderLanguageSwitcher({ variant = "light" }: Pick<LanguageSwitcherProps, "variant">) {
  const { locale, direction, availableLocales, setLocale, loading, error } = useEditorI18n();
  const t = useTranslations("web");
  const [requesting, setRequesting] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  useEffect(() => setRequestFailed(false), [locale]);
  return (
    <ReactAriaI18nProvider locale={locale}>
      <div lang={locale} dir={direction} className="relative min-w-0 max-w-[8rem] sm:max-w-[14rem]">
        <LanguageSwitcher
          locale={locale}
          availableLocales={availableLocales.map((item) => item.id)}
          onLocaleChange={(next) => {
            setRequesting(true);
            setRequestFailed(false);
            void setLocale(next)
              .catch(() => setRequestFailed(true))
              .finally(() => setRequesting(false));
          }}
          loading={loading || requesting}
          variant={variant}
          direction={direction}
          labels={{
            interfaceLanguage: t("settings.interfaceLanguage"),
            availableLanguages: t("settings.availableLanguages"),
            loading: t("browser.loading"),
          }}
        />
        <output className="sr-only">{error || requestFailed ? t("settings.changeFailed") : ""}</output>
      </div>
    </ReactAriaI18nProvider>
  );
}
