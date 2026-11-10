# Web language menu

Status: The shared searchable language menu is mounted in every apps/web header,
including the homepage. The former Select and separate wording control are removed.

## Components and resources

- [HeaderLanguageMenu](../../../apps/web/src/components/site/HeaderLanguageMenu.tsx)
  connects the effective public i18n runtime to the menu and React Aria locale.
- [LanguageMenu](../../../apps/web/src/components/site/LanguageMenu.tsx) is controlled
  presentation: a translate icon opens native language names, searchable above eight
  choices. Each language can expand its available wording profiles.
- [Web resources](../../../apps/web/src/i18n/resources.ts) opt into English, Dutch and
  16 generated language drafts, including their plain and exhibition layers.
  [Language adapters](../../../apps/web/src/i18n/locales/) import the private
  TypeScript catalogs only in the web host. Public SDK packages keep their existing
  English defaults and explicit Dutch opt-in.

The generated locales are `fr`, `de`, `it`, `es`, `pt`, `ja`, `zh`, `tr`, `fi`, `hi`,
`pl`, `uk`, `cs`, `da`, `ms` and `ta`; together with `en-GB` and `nl`, the default web
menu offers 18 languages. These additional translations remain experimental drafts;
structural coverage does not establish native-speaker review.

## Mounting

```tsx
import { HeaderLanguageMenu } from "./HeaderLanguageMenu";

<HeaderLanguageMenu />
<HeaderLanguageMenu variant="dark" />
```

Use the light variant for site, local, example, external, share and legacy headers.
BrowserEditor chooses dark when an exhibition is focused. Error and not-found routes
use the same menu. A locale/profile is never a component key.

At narrow widths, the homepage places the logo and menu on the first row and the
navigation links on the second. Desktop keeps its single header row. There is one
language control in the site header and no separate wording select.

## Selection, accessibility and policy

- Choosing a language keeps the current wording profile; expanding its caret offers
  standard/plain wording. A combined choice uses one runtime `select` operation.
- Variant labels resolve on every render so a stable translator cannot leave them
  in the previous UI language. Runtime metadata supplies each native language name;
  `Intl.DisplayNames` is the presentational fallback and distinguishes regional tags.
- The icon trigger has a translated accessible name with the active language. Each
  language name has its own `lang`; the portal inherits UI `lang`/`dir`. Loading and
  rejected requests have translated status text, and the trigger remains in the tab
  order while requests run.
- Arrow keys traverse visible search, language, caret and expanded variant controls.
  Collapsed choices are excluded. Escape closes through React Aria; each menu uses
  instance-specific IDs for its variant panels.
- Deployment locale/profile allow-lists and fallback metadata remain authoritative.
  Every offered locale must cover every offered profile. Static web coverage is
  reused across equivalent policy creation; custom resource checks still validate
  their supplied catalogs directly.
- The versioned `manifest-editor-ui` cookie stores independent UI preferences.
  Authored IIIF language maps, content-language choices, editor drafts and history
  retain their existing paths.

## Checks and limits

The complete web JSDOM suite passes **29 tests**. These cover the real site layout,
one header control and all 18 choices, live Dutch/plain wording, saved preferences,
retained authored drafts, hidden-item keyboard navigation, regional names, host
rejections, SSR hydration and deployment/exhibition policy. The additional-language
host tests exercise all 16 generated locales in both wording profiles.

The focused host no-emit check passes. The broader mapped source/test check retains
**107 dependency/baseline diagnostics**; the only web-local diagnostic is the existing
`CloudflareEnv.PREVIEW_KV` declaration mismatch. There are no new menu/adapter/test
source diagnostics. Catalog validation, lint/formatting and diff checks are recorded
in module20's integration evidence.

The existing port-3000 Playwright watch run exercises the new menu and narrow header,
but its two SSR/reload checks still fail on the previously recorded HTTP500
`Duplicate use of selection JSON ID gapcursor`. This is not a full live browser pass.
No server restart, cache deletion or package build was performed. Publication,
whole-editor browser acceptance and the remaining UI module migrations remain open.
