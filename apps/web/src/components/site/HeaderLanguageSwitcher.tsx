"use client";

import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { LanguageSwitcher, type LanguageSwitcherProps } from "./LanguageSwitcher";
import { I18nProvider as ReactAriaI18nProvider } from "react-aria-components";
import { useEffect, useState } from "react";

export function HeaderLanguageSwitcher({ variant = "light" }: Pick<LanguageSwitcherProps, "variant">) {
  const { locale, profile, direction, availableLocales, availableProfiles, setLocale, setProfile, loading, error } =
    useEditorI18n();
  const t = useTranslations("web");
  const [requesting, setRequesting] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  useEffect(() => setRequestFailed(false), [locale, profile]);
  return (
    <ReactAriaI18nProvider locale={locale}>
      <div
        lang={locale}
        dir={direction}
        className="relative flex min-w-0 max-w-[18rem] items-center gap-1 sm:max-w-[26rem]"
      >
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
        <label className="min-w-0 max-w-[8rem]">
          <span className="sr-only">{t("settings.wording")}</span>
          <select
            aria-label={t("settings.wording")}
            value={profile}
            disabled={availableProfiles.length <= 1 || loading || requesting}
            className={
              variant === "dark"
                ? "h-9 w-full rounded border border-white/20 bg-[#26212a] px-1 text-sm text-white"
                : "h-9 w-full rounded border border-slate-200 bg-white px-1 text-sm text-slate-900"
            }
            onChange={(event) => {
              setRequesting(true);
              setRequestFailed(false);
              void setProfile(event.target.value)
                .catch(() => setRequestFailed(true))
                .finally(() => setRequesting(false));
            }}
          >
            {availableProfiles.map((id) => (
              <option key={id} value={id}>
                {t(`settings.${id}`)}
              </option>
            ))}
          </select>
        </label>
        <output className="sr-only">{error || requestFailed ? t("settings.changeFailed") : ""}</output>
      </div>
    </ReactAriaI18nProvider>
  );
}
