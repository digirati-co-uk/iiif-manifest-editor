import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import type { BrowserI18n, IIIFBrowserProps } from "iiif-browser";
import { lazy, Suspense, useMemo, type ReactNode } from "react";
import { Spinner } from "./Spinner";

const Browser = lazy(() =>
  import("./IIIFBrowserI18nImpl").then((module) => ({ default: module.LocalizedIIIFBrowser }))
);
const Provider = lazy(() =>
  import("./IIIFBrowserI18nImpl").then((module) => ({ default: module.IIIFBrowserI18nProvider }))
);

/** Portable inputs for direct browsers and plugin-owned browsers. Never translates resource content. */
export function useIIIFBrowserI18n(): BrowserI18n {
  const t = useTranslations("components");
  const { locale, direction, profile } = useEditorI18n();
  return useMemo(
    () => {
      const number = new Intl.NumberFormat(locale);
      const relativeTime = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      return {
        locale,
        direction,
        translate: (key, defaultValue, values) => {
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
          return relativeTime.format(suffix === "ago" ? -value : value, units[unit] ?? "second");
        },
      };
    },
    // Profile changes must invalidate the browser command-search index as well as displayed labels.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [t, locale, direction, profile]
  );
}

/** Wrap plugin hosts so their dialogs and image options inherit the same UI inputs. */
export function IIIFBrowserI18nProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Spinner />}>
      <Provider>{children}</Provider>
    </Suspense>
  );
}

export function LocalizedIIIFBrowser(props: IIIFBrowserProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <Browser {...props} />
    </Suspense>
  );
}
