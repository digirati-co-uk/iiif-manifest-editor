import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { useId, useMemo, useState, type ComponentProps } from "react";
import DateTimePicker from "react-datetime-picker";

type Props = Pick<ComponentProps<typeof DateTimePicker>, "onChange" | "id" | "className"> & { value?: Date | null };

/** UI display only: the Date callback retains the date editor's timezone/storage semantics. */
export function NavigationDateField({ onChange, ...props }: Props) {
  const t = useTranslations("editors");
  const { locale } = useEditorI18n();
  // getDate() creates a Date on each parent render; equal instants must not reset a draft.
  const timestamp = props.value?.getTime();
  const value = useMemo(() => (timestamp === undefined ? null : new Date(timestamp)), [timestamp]);
  const [invalid, setInvalid] = useState(false);
  const errorId = useId();
  return (
    <div aria-describedby={invalid ? errorId : undefined}>
      <DateTimePicker
        {...props}
        value={value}
        locale={locale}
        calendarProps={{
          prevAriaLabel: t("messages.previousMonth"),
          nextAriaLabel: t("messages.nextMonth"),
          prev2AriaLabel: t("messages.previousYear"),
          next2AriaLabel: t("messages.nextYear"),
          navigationAriaLabel: t("messages.calendarUp"),
        }}
        calendarAriaLabel={t("navDate.openCalendar")}
        clearAriaLabel={t("navDate.clear")}
        dayAriaLabel={t("navDate.day")}
        hourAriaLabel={t("navDate.hour")}
        minuteAriaLabel={t("navDate.minute")}
        secondAriaLabel={t("messages.second")}
        amPmAriaLabel={t("messages.amPm")}
        monthAriaLabel={t("navDate.month")}
        nativeInputAriaLabel={t("fields.navDate")}
        yearAriaLabel={t("navDate.year")}
        onInvalidChange={() => setInvalid(true)}
        onChange={(value) => {
          setInvalid(false);
          onChange?.(value);
        }}
      />
      {invalid && (
        <p id={errorId} role="alert">
          {t("messages.invalidDate")}
        </p>
      )}
    </div>
  );
}
