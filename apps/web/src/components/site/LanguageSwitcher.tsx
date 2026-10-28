"use client";

import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import { useEffect, useState } from "react";

/**
 * Presentational language-switcher for the web-host header.
 *
 * Controlled API: the host owns locale state and supplies the allowed list.
 * The component has no runtime dependency — it does not import from
 * packages/i18n or internal-packages/languages. The Sol web-host module
 * will wire it to the provider after runtime integration.
 *
 * Suitable for:
 *   - apps/web (site)/layout.tsx  → variant="light" (default)
 *   - apps/web BrowserEditor header normal mode  → variant="light"
 *   - apps/web BrowserEditor header isFocusedExhibition mode  → variant="dark"
 */

export interface LanguageSwitcherProps {
  /** BCP-47 locale tag that is currently active, e.g. "en-GB" or "nl". */
  locale: string;
  /** Ordered list of selectable locale tags the host permits. */
  availableLocales: readonly string[];
  /** Called with the new locale tag when the user confirms a selection. */
  onLocaleChange: (locale: string) => void;
  /** Localised interface copy supplied by the host's web namespace. */
  labels: {
    interfaceLanguage: string;
    availableLanguages: string;
    loading: string;
  };
  /**
   * Set true while a locale change is being applied.
   * Renders a spinner and disables the control without removing it from the
   * tab order (preserves focus for keyboard users).
   */
  loading?: boolean;
  /**
   * "light"  — white/light-grey header (default).
   * "dark"   — focused-exhibition purple header (bg-[#26212a] / bg-[#18161d]).
   */
  variant?: "light" | "dark";
}

/** Returns the native display name for a locale, e.g. "en-GB" → "English", "nl" → "Nederlands". */
function nativeName(locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "language", languageDisplay: "standard" }).of(locale) ?? locale;
  } catch {
    return locale;
  }
}

export function LanguageSwitcher({
  locale,
  availableLocales,
  onLocaleChange,
  labels,
  loading = false,
  variant = "light",
}: LanguageSwitcherProps) {
  const isDark = variant === "dark";
  const isDisabled = availableLocales.length <= 1;
  const [isOpen, setOpen] = useState(false);
  useEffect(() => {
    if (loading || isDisabled) setOpen(false);
  }, [loading, isDisabled]);

  const triggerClass = isDark
    ? "flex h-9 max-w-full items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
    : "flex h-9 max-w-full items-center gap-1.5 rounded border border-slate-200 bg-white px-3 text-sm text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-600 focus-visible:ring-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

  const popoverClass = isDark
    ? "z-50 min-w-[9rem] overflow-hidden rounded-md border border-white/20 bg-[#2d2836] py-1 shadow-xl outline-none"
    : "z-50 min-w-[9rem] overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg outline-none";

  return (
    <Select
      className="min-w-0 max-w-[14rem] shrink-0"
      selectedKey={locale}
      onSelectionChange={(key) => {
        if (!loading && !isDisabled && typeof key === "string" && key !== locale) onLocaleChange(key);
      }}
      isDisabled={isDisabled}
      isOpen={!loading && !isDisabled && isOpen}
      onOpenChange={(open) => setOpen(open && !loading && !isDisabled)}
    >
      {/* Visible label is sr-only; the current value is part of the button's accessible name via SelectValue. */}
      <Label className="sr-only">{labels.interfaceLanguage}</Label>

      <Button className={triggerClass} aria-disabled={loading || isDisabled}>
        {/* SelectValue renders the textValue of the selected ListBoxItem and is part of the button's accessible name. */}
        <SelectValue className="min-w-0 truncate">
          {(renderProps) => (
            <span lang={locale} title={nativeName(locale)}>
              {renderProps.isPlaceholder || !renderProps.selectedText ? nativeName(locale) : renderProps.selectedText}
            </span>
          )}
        </SelectValue>

        {loading ? (
          <SpinnerIcon className={isDark ? "flex-none text-white/70" : "flex-none text-slate-400"} />
        ) : (
          <ChevronDownIcon
            aria-hidden="true"
            className={isDark ? "flex-none text-white/70" : "flex-none text-slate-400"}
          />
        )}
      </Button>

      <Popover placement="bottom end" className={popoverClass}>
        <ListBox className="outline-none" aria-label={labels.availableLanguages}>
          {availableLocales.map((loc) => (
            <ListBoxItem
              key={loc}
              id={loc}
              textValue={nativeName(loc)}
              className={({ isSelected, isFocused }: { isSelected: boolean; isFocused: boolean }) =>
                [
                  "flex cursor-default select-none items-center gap-2 px-3 py-2 text-sm outline-none",
                  isDark
                    ? `${isFocused ? "bg-white/10" : ""} ${isSelected ? "font-semibold text-white" : "text-white/90"}`
                    : `${isFocused ? "bg-me-primary-50" : ""} ${isSelected ? "font-medium text-me-primary-600" : "text-slate-900"}`,
                ]
                  .join(" ")
                  .trim()
              }
            >
              {({ isSelected }: { isSelected: boolean }) => (
                <>
                  <span lang={loc} className="flex-1">
                    {nativeName(loc)}
                  </span>
                  {/* Fixed-width slot keeps option text aligned whether or not selected. */}
                  <span aria-hidden="true" className="h-3.5 w-3.5 flex-none">
                    {isSelected ? <CheckIcon className={isDark ? "text-white/80" : "text-me-primary-600"} /> : null}
                  </span>
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
      <output className="sr-only">{loading ? labels.loading : ""}</output>
    </Select>
  );
}

function ChevronDownIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SpinnerIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
