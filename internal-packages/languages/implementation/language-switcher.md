# Language Switcher — design and mounting guide

Status: **Component implemented; provider wiring deferred** to Sol web-host module.

File: [`apps/web/src/components/site/LanguageSwitcher.tsx`](../../../../apps/web/src/components/site/LanguageSwitcher.tsx)

---

## Component API

```tsx
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

<LanguageSwitcher
  locale="en-GB"                          // currently active BCP-47 tag
  availableLocales={["en-GB", "nl"]}      // host-allowed list, ordered
  onLocaleChange={(locale) => /* … */}    // called with new tag on selection
  loading={false}                         // true while applying the change
  variant="light"                         // "light" | "dark" — see below
/>
```

### Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `locale` | `string` | required | Active BCP-47 tag, e.g. `"en-GB"` or `"nl"` |
| `availableLocales` | `readonly string[]` | required | Ordered list the host permits |
| `onLocaleChange` | `(locale: string) => void` | required | Called once on confirmed selection |
| `loading` | `boolean` | `false` | Renders a spinner; disables control without removing focus |
| `variant` | `"light" \| "dark"` | `"light"` | See header variants below |

### Behaviour

- **Display names** — uses `Intl.DisplayNames` with each locale's own base language tag so names are always native: `"en-GB" → English`, `"nl" → Nederlands`. No flags.
- **Disabled** — automatically disabled when `loading=true` or `availableLocales.length <= 1` (nothing to switch to). The control remains in the tab order when loading (spinner) so keyboard users keep their position.
- **Keyboard** — inherits react-aria-components `Select`: `Space`/`Enter` opens, arrow keys navigate, `Escape` closes, `Tab` moves focus away without selecting.
- **Screen reader** — the hidden `<Label>` element reads "Interface language". `SelectValue` makes the selected name part of the button's accessible name. Each `ListBoxItem` has `lang={loc}` so the AT uses the correct language's pronunciation rules for the native name. The `ListBox` has `aria-label="Available languages"`.
- **`lang` attribute** — the trigger button renders `<span lang={locale}>` around the active locale name so screen readers pronounce, e.g., "Nederlands" correctly even when the host document is `lang="en"`.

---

## Variant: `"light"` (default)

Suits white or light-grey headers. Uses `border-slate-200 bg-white text-slate-900` trigger, `me-primary-50` hover and `me-primary-600` ring/selected-item accent.

### Mounting location 1 — `(site)/layout.tsx`

Add inside (or alongside) `<GlobalNav>` on the right of the 64 px site header:

```diff
// apps/web/src/app/(main)/(site)/layout.tsx
+import { LanguageSwitcher } from "../../../components/site/LanguageSwitcher";

 <header className="h-[64px] flex w-full gap-[clamp(0.5rem,3.75vw,3rem)] …">
   <Link …><ManifestEditorLogo … /></Link>
   <div className="flex-1" />
   <div>
     <GlobalNav />
   </div>
+  <LanguageSwitcher
+    locale={activeLocale}
+    availableLocales={allowedLocales}
+    onLocaleChange={handleLocaleChange}
+  />
 </header>
```

`activeLocale`, `allowedLocales`, and `handleLocaleChange` come from `useEditorI18n()` in the shared public runtime. Mount with real locale selection after provider integration; a no-op switcher must not ship.

---

## Variant: `"dark"`

Suits the focused-exhibition purple header (`bg-[#26212a]` / `bg-[#18161d]`). Uses `border-white/20 bg-white/10 text-white` trigger; the dropdown panel uses `bg-[#2d2836]` (slightly lighter than the header to give layering depth).

### Mounting location 2 — `BrowserEditor.tsx` header

The editor header has two modes. The switcher belongs inside `headerStyles.actionButtons` in both:

```diff
// apps/web/src/components/browser-editor/BrowserEditor.tsx
+import { LanguageSwitcher } from "../site/LanguageSwitcher";

 <div className={`${headerStyles.actions} flex items-center justify-end`}>
   <div className={headerStyles.actionButtons}>
     <ShareButton />
     <BackgroundActionsMenu />
     {isFocusedExhibition ? (
       <button … onClick={toggleExhibitionTheme}>…</button>
     ) : null}
+    <LanguageSwitcher
+      locale={activeLocale}
+      availableLocales={allowedLocales}
+      onLocaleChange={handleLocaleChange}
+      variant={isFocusedExhibition ? "dark" : "light"}
+    />
     <PresetPreviewButton … />
   </div>
 </div>
```

The `variant` prop is reactive — it switches between `"light"` and `"dark"` as `isFocusedExhibition` changes, with no remount required.

---

## Other header routes

The following routes also have headers that will eventually show the switcher. Sol web-host integration should mount it consistently across all of them after the runtime provider is available. None require a structural change to the component:

| Route | File | Notes |
|-------|------|-------|
| `/local` | `src/components/local-editor/LocalEditor.tsx` | light |
| `/share` | `src/app/(main)/share/page.tsx` | light |
| `/examples` | `src/app/(main)/examples/layout.tsx` | light |
| External editor | `src/components/external-editor/ExternalEditor.tsx` | light |
| Legacy editor | `src/components/LegacyManifestEditor/…` | audit before adding |

---

## What the Sol web-host module must provide

This component is purely presentational. It depends on the runtime (module `01-public-runtime.md`) to supply:

1. A hook or context value for `locale` (current selection).
2. A hook or context value for `availableLocales` (host allow-list).
3. A callback for `onLocaleChange` that:
   - Loads required catalogs for the new locale.
   - Commits the locale change without remounting or resetting the vault.
   - Persists the user preference (separate from content-language config).
   - Handles the loading race described in the internationalisation plan.

Use the public `@manifest-editor/i18n` package for React hooks and `@manifest-editor/i18n/nl` for optional Dutch catalog data. Do not import private authoring sources from application code.

---

## Dutch locale registration

The optional public `@manifest-editor/i18n/nl` entry now exports `dutchCatalogs`, `dutchPlain`, `dutchExhibition` and `dutchExhibitionPlain`. Configure the provider with `locales: [...defaultLocales, dutchLocale]`, `catalogs: dutchCatalogs`, and `profiles: {plain: dutchPlain}`. The runtime remains English by default. See `packages/i18n/README.md` for the full configuration. No application is enabled until the web host wires it.

The private authoring package exports all Dutch catalog subpaths. All 25 source/overlay files pass parity validation and strict unchanged-source review; consumer modules must expand these catalogs as they migrate remaining UI.

## Parent review findings for web integration

- Translate the hidden label, option-list accessible name and loading announcement with web-owned keys.
- Preserve keyboard focus while loading; the current `isDisabled` behavior conflicts with the tab-order claim above. Use appropriate focus-preserving unavailable/loading behavior and test it.
- Provide a localized loading/status announcement outside `aria-hidden` content.
- Check narrow site/editor headers with full native language names and existing navigation.
- Wire all supported header variants to the same live provider; do not mount a no-op placeholder.

---

## Acceptance checks (for Sol web-host wiring)

- [ ] Changing locale does not remount the editor, lose vault state, or reset undo history.
- [ ] A persisted preference is applied on the next page load without flashing the fallback.
- [ ] The `loading` spinner appears while catalogs are fetching and disappears on success.
- [ ] With only one available locale, the control renders but is inert (no dropdown opens).
- [ ] The `lang` attribute on the trigger text changes when the locale changes.
- [ ] Exhibition header switches between `variant="dark"` and `variant="light"` without remount.
- [ ] No IIIF content-language fields, resource labels, IDs, or export data change when the UI locale changes.
