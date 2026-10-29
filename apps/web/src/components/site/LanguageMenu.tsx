"use client";

/**
 * LanguageMenu: one header control for the interface language AND its variants.
 *
 * Why this exists
 * ---------------
 * The header used to show two controls side by side: `LanguageSwitcher` (a native-name Select) and a second
 * `<select>` for the wording profile (standard / plain). Two controls for one idea ("how should the interface read
 * to me?") was noisy and would not scale: more locales means a longer Select, and more profiles or regional
 * variants (en-GB / en-US, ...) would mean even more boxes in the header.
 *
 * What changed
 * ------------
 * - The trigger is a single icon button (the "translate" glyph). The current language is in its tooltip and
 *   accessible name, not on screen, so the header stays quiet at any number of languages.
 * - The popover lists every supported language by its native name ("Nederlands", not "Dutch"), so people can find
 *   their own language without reading another one first.
 * - A language that has variants (today: the wording profiles; later regional variants such as "British English")
 *   shows a small caret. Pressing it unfolds the variants beneath that row. Choosing a variant sets language and
 *   variant together; choosing the row itself keeps the variant the user already has.
 * - Built for long lists: the list scrolls inside the popover and a search field appears once there are more than
 *   `SEARCH_THRESHOLD` languages. Arrow keys move through rows, carets and variants in reading order.
 *
 * Scope
 * -----
 * Presentational and controlled: no import from packages/i18n or the languages package.
 * `HeaderLanguageMenu` wires it to the runtime in every web header.
 */

import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";

/** Show the search field once the list is longer than this. */
const SEARCH_THRESHOLD = 8;

export interface LanguageMenuVariant {
  /** Stable id handed back to `onSelect`, e.g. a profile id such as "plain". */
  id: string;
  /** Already-localised label shown to the user, e.g. "Plain wording". */
  label: string;
}

export interface LanguageMenuOption {
  /** BCP-47 locale tag, e.g. "en-GB" or "nl". */
  id: string;
  /** Override the native name when Intl cannot produce a good one. */
  name?: string;
  /** Extra choices for this language. The caret only appears when there are two or more. */
  variants?: readonly LanguageMenuVariant[];
}

export interface LanguageMenuProps {
  /** Active BCP-47 locale tag. */
  locale: string;
  /** Id of the active variant, matched against `LanguageMenuVariant.id` of the active language. */
  activeVariant?: string;
  /** Ordered, host-permitted languages. */
  options: readonly LanguageMenuOption[];
  /** `variant` is only set when the user picked one explicitly; otherwise the host keeps its current variant. */
  onSelect: (selection: { locale: string; variant?: string }) => void;
  labels: {
    interfaceLanguage: string;
    availableLanguages: string;
    loading: string;
    searchLanguages: string;
    noLanguages: string;
    /** Accessible name of a caret, given the language's native name, e.g. "More options for Nederlands". */
    moreOptions: (language: string) => string;
  };
  /** Disables the control without removing it from the tab order, so keyboard focus is kept. */
  loading?: boolean;
  /** "light" for the white header (default), "dark" for the focused-exhibition header. */
  variant?: "light" | "dark";
  direction?: "ltr" | "rtl";
}

/** Returns the native display name for a locale, e.g. "en-GB" → "English", "nl" → "Nederlands". */
function nativeName(locale: string): string {
  try {
    return (
      new Intl.DisplayNames([locale], {
        type: "language",
        languageDisplay: "standard",
      }).of(locale) ?? locale
    );
  } catch {
    return locale;
  }
}

export function LanguageMenu({
  locale,
  activeVariant,
  options,
  onSelect,
  labels,
  loading = false,
  variant = "light",
  direction = "ltr",
}: LanguageMenuProps) {
  const isDark = variant === "dark";
  const [isOpen, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const rows = useMemo(
    () =>
      options.map((option) => ({
        ...option,
        displayName: option.name ?? nativeName(option.id),
      })),
    [options]
  );
  const showSearch = rows.length > SEARCH_THRESHOLD;
  const needle = query.trim().toLocaleLowerCase(locale);
  const visible = needle
    ? rows.filter(
        (row) => row.displayName.toLocaleLowerCase(locale).includes(needle) || row.id.toLowerCase().includes(needle)
      )
    : rows;
  const currentName = rows.find((row) => row.id === locale)?.displayName ?? nativeName(locale);

  useEffect(() => {
    if (loading) setOpen(false);
  }, [loading]);

  // Every time the menu opens it starts folded and unfiltered.
  useEffect(() => {
    if (isOpen) return;
    setExpanded(new Set());
    setQuery("");
  }, [isOpen]);

  const select = (selection: { locale: string; variant?: string }) => {
    setOpen(false);
    const changed = selection.locale !== locale || (selection.variant && selection.variant !== activeVariant);
    if (changed) onSelect(selection);
  };

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  // Up/Down walk every focusable control (search, rows, carets, variants) in reading order.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = [...(panelRef.current?.querySelectorAll<HTMLElement>("[data-lm-focus]") ?? [])].filter(
      (item) => !item.closest("[hidden]")
    );
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  };

  const muted = isDark ? "text-white/60" : "text-slate-500";
  // Same shape and colours as the other header buttons (share, bulk actions); the dark header keeps its own palette.
  const triggerClass = isDark
    ? "flex flex-none items-center justify-center rounded-md border border-white/20 bg-white/10 p-1 text-2xl text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 aria-disabled:cursor-wait aria-disabled:opacity-60"
    : "flex flex-none cursor-pointer items-center justify-center rounded-md bg-me-gray-100 p-1 text-2xl text-me-primary-500 transition-colors hover:bg-me-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500 aria-disabled:cursor-wait aria-disabled:opacity-60";
  // Filled while the menu is open, like the active bulk actions button.
  const openTriggerClass = isDark ? "bg-white/20" : "!bg-me-primary-500 !text-white";
  const popoverClass = isDark
    ? "z-50 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-white/20 bg-[#2d2836] text-white shadow-xl outline-none"
    : "z-50 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg outline-none";
  // Each item is its own rounded block with even space around it. States stay deliberately separate:
  //   hover / focus  → a neutral darkening overlay on whatever is underneath (works on the tinted row too)
  //   selected       → ME pink tint with pink text, which the neutral hover overlay never replaces
  const rowShell = (selected: boolean) =>
    [
      "relative overflow-hidden rounded-lg transition-colors",
      selected ? (isDark ? "bg-me-primary-500/20" : "bg-me-primary-50") : "",
    ].join(" ");
  const hoverOverlay = isDark ? "hover:bg-white/10" : "hover:bg-black/[0.045]";
  const focusRing = isDark ? "focus-visible:ring-white/60" : "focus-visible:ring-me-primary-600";
  const rowClass = (selected: boolean) =>
    [
      "flex min-h-11 min-w-0 flex-1 items-center gap-2 bg-transparent px-4 py-2 text-start text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset",
      hoverOverlay,
      focusRing,
      isDark
        ? selected
          ? "font-semibold text-white"
          : "text-white/90"
        : selected
          ? "font-medium text-me-primary-600"
          : "text-slate-900",
    ].join(" ");
  const caretClass = [
    "flex min-h-11 w-12 flex-none items-center justify-center bg-transparent outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset",
    hoverOverlay,
    focusRing,
    isDark ? "text-white/70" : "text-slate-500",
  ].join(" ");

  // Same feel as the bulk actions menu: a short fade while sliding up 8px. Exiting is handled by react-aria, which
  // keeps the popover mounted until the exit animation ends.
  const motion =
    "data-[entering]:animate-[lm-in_150ms_ease-out] data-[exiting]:animate-[lm-out_120ms_ease-in_forwards] motion-reduce:animate-none";

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={(open) => setOpen(open && !loading)}>
      <Button
        className={`${triggerClass} ${isOpen ? openTriggerClass : ""}`}
        aria-label={`${labels.interfaceLanguage}: ${currentName}`}
        aria-disabled={loading}
      >
        {loading ? <SpinnerIcon /> : <TranslateIcon />}
      </Button>
      <Popover placement="bottom end" offset={8} className={`${popoverClass} ${motion}`} lang={locale} dir={direction}>
        <Dialog aria-label={labels.interfaceLanguage} className="outline-none">
          <div ref={panelRef} onKeyDown={onKeyDown}>
            {showSearch ? (
              <div className={`border-b p-2 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <input
                  data-lm-focus
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label={labels.searchLanguages}
                  placeholder={labels.searchLanguages}
                  className={
                    isDark
                      ? "h-8 w-full rounded border border-white/20 bg-white/10 px-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      : "h-8 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-600"
                  }
                />
              </div>
            ) : null}

            <ul
              aria-label={labels.availableLanguages}
              className="flex max-h-[min(24rem,60vh)] flex-col gap-0.5 overflow-y-auto p-1.5"
            >
              {visible.map((row) => {
                const selected = row.id === locale;
                const variants = row.variants && row.variants.length > 1 ? row.variants : null;
                const open = !!variants && expanded.has(row.id);
                const panelId = `${menuId}-variants-${row.id}`;
                const activeLabel = selected ? variants?.find((item) => item.id === activeVariant)?.label : undefined;
                return (
                  <li key={row.id}>
                    <div className={`flex items-stretch ${rowShell(selected)}`}>
                      <button
                        type="button"
                        data-lm-focus
                        aria-current={selected ? "true" : undefined}
                        className={rowClass(selected)}
                        onClick={() => select({ locale: row.id })}
                      >
                        <span className="min-w-0 flex-1">
                          <span lang={row.id} className="block truncate">
                            {row.displayName}
                          </span>
                          {activeLabel ? (
                            <span className={`block truncate text-xs ${muted}`}>{activeLabel}</span>
                          ) : null}
                        </span>
                      </button>
                      {variants ? (
                        <button
                          type="button"
                          data-lm-focus
                          aria-expanded={open}
                          aria-controls={panelId}
                          aria-label={labels.moreOptions(row.displayName)}
                          className={caretClass}
                          onClick={() => toggle(row.id)}
                        >
                          <CaretIcon className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      ) : null}
                    </div>
                    {variants ? (
                      <ul id={panelId} hidden={!open} className="mt-0.5 flex flex-col gap-0.5 ps-4">
                        {variants.map((item) => {
                          const active = selected && item.id === activeVariant;
                          return (
                            <li key={item.id} className={rowShell(active)}>
                              <button
                                type="button"
                                data-lm-focus
                                aria-current={active ? "true" : undefined}
                                className={`${rowClass(active)} w-full`}
                                onClick={() => select({ locale: row.id, variant: item.id })}
                              >
                                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {visible.length === 0 ? <p className={`px-3 py-4 text-sm ${muted}`}>{labels.noLanguages}</p> : null}
          </div>
        </Dialog>
      </Popover>
      <style>{`@keyframes lm-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes lm-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(8px)}}`}</style>
      <output className="sr-only">{loading ? labels.loading : ""}</output>
    </DialogTrigger>
  );
}

export function TranslateIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path
        d="m12.87 15.07-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7 1.62-4.33L19.12 17h-3.24z"
        fill="currentColor"
      />
    </svg>
  );
}

function CaretIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
