import { ComponentI18nProvider } from "./ComponentI18nProvider";
import { EditorI18nScope, useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { BrowserI18nProvider, IIIFBrowser, type BrowserI18n, type IIIFBrowserProps } from "iiif-browser";
import { useMemo, type ReactNode } from "react";

/** Portable inputs for direct browsers and plugin-owned browsers. Never translates resource content. */
export function useIIIFBrowserI18n(): BrowserI18n {
  const t = useTranslations("components");
  const { locale, direction, profile } = useEditorI18n();
  return useMemo(
    () => ({
      locale,
      direction,
      translate: (key, defaultValue, values) => {
        const number = new Intl.NumberFormat(locale);
        const formatted =
          values &&
          Object.fromEntries(
            Object.entries(values).map(([name, value]) => [
              name,
              name !== "count" && typeof value === "number" ? number.format(value) : value,
            ])
          );
        return t(`browser.${key}`, formatted, { defaultValue });
      },
      formatRelativeTime: (value, unit, suffix) => {
        const units: Record<string, Intl.RelativeTimeFormatUnit> = {
          second: "second",
          minute: "minute",
          hour: "hour",
          day: "day",
          week: "week",
          month: "month",
          year: "year",
        };
        return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
          suffix === "ago" ? -value : value,
          units[unit] ?? "second"
        );
      },
    }),
    // Profile changes must invalidate the browser command-search index as well as displayed labels.
    [t, locale, direction, profile]
  );
}

/** Wrap plugin hosts so their dialogs and image options inherit the same UI inputs. */
export function IIIFBrowserI18nProvider({ children }: { children: ReactNode }) {
  const i18n = useIIIFBrowserI18n();
  return (
    <ComponentI18nProvider>
      <EditorI18nScope>
        <BrowserI18nProvider i18n={i18n}>{children}</BrowserI18nProvider>
      </EditorI18nScope>
    </ComponentI18nProvider>
  );
}

export function LocalizedIIIFBrowser(props: IIIFBrowserProps) {
  const i18n = useIIIFBrowserI18n();
  return (
    <ComponentI18nProvider>
      <IIIFBrowser i18n={i18n} {...props} />
    </ComponentI18nProvider>
  );
}
