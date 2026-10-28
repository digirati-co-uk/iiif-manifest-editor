"use client";

import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { LanguageSwitcher, type LanguageSwitcherProps } from "./LanguageSwitcher";
import { I18nProvider as ReactAriaI18nProvider } from "react-aria-components";

export function HeaderLanguageSwitcher({ variant = "light" }: Pick<LanguageSwitcherProps, "variant">) {
  const { locale, direction, availableLocales, setLocale, loading, error } = useEditorI18n();
  const t = useTranslations("web");
  return (
    <ReactAriaI18nProvider locale={locale}>
      <div lang={locale} dir={direction} className="relative min-w-0 max-w-[8rem] sm:max-w-[14rem]">
        <LanguageSwitcher
          locale={locale}
          availableLocales={availableLocales.map((item) => item.id)}
          onLocaleChange={(next) => {
            void setLocale(next).catch(() => {});
          }}
          loading={loading}
          variant={variant}
          direction={direction}
          labels={{
            interfaceLanguage: t("settings.interfaceLanguage"),
            availableLanguages: t("settings.availableLanguages"),
            loading: t("browser.loading"),
          }}
        />
        <output className="sr-only">{error ? t("settings.changeFailed") : ""}</output>
      </div>
    </ReactAriaI18nProvider>
  );
}
