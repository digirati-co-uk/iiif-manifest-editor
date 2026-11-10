import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import type { MediaPlayerProps } from "@vidstack/react";
import { useMemo } from "react";

/** UI time speech for one player; independent of subtitle/content languages. */
export function useMediaTimeTranslations(): NonNullable<MediaPlayerProps["uiTime"]> {
  const t = useTranslations("components");
  const { locale } = useEditorI18n();
  return useMemo(() => {
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    const formatSpokenTime = (duration: number) => {
      const total = Number.isFinite(duration) ? Math.max(0, Math.floor(duration)) : 0;
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      const parts: string[] = [];
      if (hours) parts.push(t("media.time.hours", { count: hours, value: number.format(hours) }));
      if (minutes) parts.push(t("media.time.minutes", { count: minutes, value: number.format(minutes) }));
      if (seconds || !parts.length)
        parts.push(t("media.time.seconds", { count: seconds, value: number.format(seconds) }));
      return new Intl.ListFormat(locale, { style: "long", type: "unit" }).format(parts);
    };
    return {
      formatSpokenTime,
      formatTimeRange: (currentTime, duration) =>
        Number.isFinite(currentTime)
          ? t("media.time.range", { current: formatSpokenTime(currentTime), duration: formatSpokenTime(duration) })
          : t("media.time.live"),
      formatSeek: (seconds, direction) =>
        t(`media.time.seek${direction === "forward" ? "Forward" : "Backward"}`, { time: formatSpokenTime(seconds) }),
    };
  }, [t, locale]);
}
