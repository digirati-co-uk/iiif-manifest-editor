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

`activeLocale`, `allowedLocales`, and `handleLocaleChange` come from the Sol runtime provider once wired. Until then, a static stub is sufficient for visual integration:

```tsx
// Stub — replace with provider hook once runtime is integrated
const activeLocale = "en-GB";
const allowedLocales = ["en-GB", "nl"] as const;
const handleLocaleChange = (_locale: string) => {};
```

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

Until that hook exists, mount with a static stub or skip mounting. Do not import from `packages/i18n` or `internal-packages/languages` directly from `apps/web` components.

---

## Dutch locale registration

The Dutch (nl) catalogs are complete against the current seed catalogs but are **not yet registered** in `internal-packages/languages/src/catalogs.ts`. After runtime integration, the parent must:

1. Add `nl` locale metadata to `localeDefinitions` in `catalogs.ts`:
   ```ts
   { id: "nl", nativeName: "Nederlands", direction: "ltr" as const }
   ```
2. Add nl loaders to `builtinLoaders` for all 19 namespaces.
3. Add nl plain-profile loaders to `plainLoaders`.
4. Add nl exhibition preset and plain/exhibition overlay loaders.
5. Add subpath exports to `package.json`:
   ```json
   "./locales/nl/*":                        "./src/locales/nl/*.ts",
   "./profiles/plain/nl/*":                 "./src/profiles/plain/nl/*.ts",
   "./presets/exhibition/nl/*":             "./src/presets/exhibition/nl/*.ts",
   "./presets/exhibition/plain/nl/*":       "./src/presets/exhibition/plain/nl/*.ts"
   ```

The exact file paths are in `test/nl-parity.test.mjs` which imports and validates all 25 nl catalog files.

---

## Acceptance checks (for Sol web-host wiring)

- [ ] Changing locale does not remount the editor, lose vault state, or reset undo history.
- [ ] A persisted preference is applied on the next page load without flashing the fallback.
- [ ] The `loading` spinner appears while catalogs are fetching and disappears on success.
- [ ] With only one available locale, the control renders but is inert (no dropdown opens).
- [ ] The `lang` attribute on the trigger text changes when the locale changes.
- [ ] Exhibition header switches between `variant="dark"` and `variant="light"` without remount.
- [ ] No IIIF content-language fields, resource labels, IDs, or export data change when the UI locale changes.
