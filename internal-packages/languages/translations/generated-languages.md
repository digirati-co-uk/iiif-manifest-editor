# Additional language drafts

These catalogs add one locale per language, without country-specific variants:

| Locale | Language   | Native name   |
| ------ | ---------- | ------------- |
| fr     | French     | Français      |
| de     | German     | Deutsch       |
| it     | Italian    | Italiano      |
| es     | Spanish    | Español       |
| pt     | Portuguese | Português     |
| ja     | Japanese   | 日本語        |
| zh     | Chinese    | 中文          |
| tr     | Turkish    | Türkçe        |
| fi     | Finnish    | Suomi         |
| hi     | Hindi      | हिन्दी        |
| pl     | Polish     | Polski        |
| uk     | Ukrainian  | Українська    |
| cs     | Czech      | Čeština       |
| da     | Danish     | Dansk         |
| ms     | Malay      | Bahasa Melayu |
| ta     | Tamil      | தமிழ்         |

Existing English and Dutch catalogs supply the other requested languages. Chinese
uses simplified characters in this initial draft; there is no separate Hong Kong
or traditional-script catalog. Portuguese uses Brazilian wording under the shared
`pt` tag for this initial draft. All added languages use left-to-right text.

## Files and integration

Each locale follows the existing authoritative TypeScript layout: 19 base
namespace files in `src/locales/<locale>/`, five plain-wording overlays in
`src/profiles/plain/<locale>/`, and the exhibition and exhibition/plain editor
overlays in `src/presets/exhibition/`. There are 26 files per added language.
No second permanent JSON translation source is maintained.

The web app explicitly opts into these drafts through
`apps/web/src/i18n/additional-resources.ts` and one resource adapter per language
in `apps/web/src/i18n/locales/`. Its existing language menu now offers all 18
languages, subject to the deployment's configured locale allow-list. Both wording
profiles and exhibition overlays are supplied. English remains the default.
Shared package defaults, package exports and the language-menu components are
unchanged; these private catalogs are imported only by the web host adapters.

## Provenance and review status

Created on 2026-10-28 after reading the full English and Dutch base catalogs,
plain-wording overlays, exhibition overlays and translator context. Initial text
was machine translated with Google Translate, then corrected for common action
labels, ambiguous short labels, navigation-date labels, generic item terminology,
locale-specific plural forms and literal tutorial/configuration examples.

These are generated drafts, not native-speaker-reviewed translations. In
particular, the long IIIF documentation, tutorial instructions, legal/license
terminology, consistent domain terminology and grammatical agreement still need
linguistic review. Successful structural validation does not establish translation
quality. The ordinary `translations:check -- --locale <tag>` review gate remains
applicable: identical English words require exact-source terminology reviews.
No blanket unchanged-English exceptions or false review approvals are supplied.

## Validation

`test/generated-locales.test.mjs` checks every added base catalog and every overlay
against the **current** English source. It checks required keys, locale-specific
cardinal plural categories, named placeholders, supported syntax and rich tags,
plus Joyride/CodeMirror tokens. Additional checks preserve tutorial URLs, the
English exercise label, JSON dimension examples, Markdown checkboxes, the recipe
title, configuration property names and example BCP 47 codes. These checks are
included in the package's existing test command:

```sh
npm --prefix internal-packages/languages test
npm --prefix internal-packages/languages run typecheck
npm --prefix internal-packages/languages run validate
```

For linguistic review and exact-source terminology exceptions, also run:

```sh
npm --prefix internal-packages/languages run translations:check -- --locale fr
```

Replace `fr` with the language being reviewed. Keep translator notes and genuine
unchanged-term reviews specific to each message; do not approve whole namespaces.
