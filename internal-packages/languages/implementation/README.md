# Internationalisation implementation tasks

The catalog foundation and public React runtime are implemented. Production UI migration is underway; no whole-UI or Dutch-completeness claim is made yet. The seed catalogs cover 264 messages in 19 namespaces; they do not cover every candidate in the repository.

Each guide below is a separate unit of work with prerequisites, concrete surfaces, implementation steps and acceptance checks. Work in the listed order when tackling modules one by one; prerequisite links are the authoritative dependency list. Mark completion in the guide and this index only after acceptance checks pass.

## Task index

| Order | Module or task | State | Namespace ownership |
| --- | --- | --- | --- |
| 00 | [Language catalog foundation](modules/00-languages.md) | Implemented foundation; seed coverage only | all built-in namespaces |
| 01 | [Public i18n runtime and workspace bootstrap](modules/01-public-runtime.md) | Implemented; independent review pending | runtime contract; no messages owned |
| 02 | [Editor API display metadata](modules/02-editor-api.md) | Pending | editor-api |
| 03 | [Creator API message contracts](modules/03-creator-api.md) | Pending | creator-api |
| 04 | [Shared component messages and accessibility](modules/04-components.md) | Pending | components and common |
| 05 | [UI package and duplicate widget audit](modules/05-ui.md) | Pending | ui and common |
| 06 | [Shell configuration and definition integration](modules/06-shell.md) | Pending | shell and common |
| 07 | [Shared property editors and forms](modules/07-editors.md) | Pending | editors and common |
| 08 | [Resource creator forms](modules/08-creators.md) | Pending | creators and common |
| 09 | [Project and draft controls](modules/09-projects.md) | Pending | projects and common |
| 10 | [Manifest preset workflows](modules/10-manifest-preset.md) | Pending | manifest plus shared namespaces |
| 11 | [Collection preset workflows](modules/11-collection-preset.md) | Pending | collection plus shared namespaces |
| 12 | [Exhibition presets and terminology](modules/12-exhibition-preset.md) | Pending | exhibition plus editors overlays |
| 13 | [Annotations plugin](modules/13-plugin-annotations.md) | Pending | plugin-annotations |
| 14 | [Canvas label generator plugin](modules/14-plugin-canvas-label-generator.md) | Pending | plugin-canvas-label-generator |
| 15 | [OCR classification plugin](modules/15-plugin-ocr-classification.md) | Pending | plugin-ocr-classification |
| 16 | [Docling OCR plugin](modules/16-plugin-ocr-docling.md) | Pending | plugin-ocr-docling |
| 17 | [Specifications plugin](modules/17-plugin-specifications.md) | Pending | plugin-specifications |
| 18 | [Content translation plugin interface](modules/18-plugin-translation.md) | Pending | plugin-translation |
| 19 | [Public editor facade and browser distribution](modules/19-manifest-editor.md) | Pending | facade-owned messages use shell/common or a dedicated reviewed namespace |
| 20 | [Web host locale preferences and application UI](modules/20-web.md) | Pending | web plus reusable editor namespaces |
| 21 | [Vite external integration example](modules/21-vite-example.md) | Pending | example-owned text, optional; editor messages stay in their owners |
| 22 | [Storybook localisation coverage](modules/22-storybook.md) | Pending | story titles stay developer-facing unless explicitly needed |
| 23 | [End to end localisation acceptance](modules/23-playwright.md) | Pending | no catalog ownership |
| 24 | [Client vault language boundary](modules/24-client-vault.md) | Reviewed; remains language-neutral | none |
| 25 | [Server vault language boundary](modules/25-server-vault.md) | Reviewed; remains language-neutral | none |
| 26 | [Preview server and external viewer boundary](modules/26-iiif-preview-server.md) | Pending | preview-owned UI only if present |
| 27 | [Integration and translation contributor documentation](modules/27-docs.md) | Pending | documentation localisation is a separate scope |
| 28 | [Shared TypeScript configuration compatibility](modules/28-typescript-config.md) | Pending | none |
| 29 | [Catalog quality gates and publishing](modules/29-release-and-ci.md) | Pending | validation and ownership policy |

## How to use a module guide

1. Read its prerequisites and the linked source inventory. The default scan estimates application-source candidates; expanded lists include supporting JS/TS that may need assertion updates rather than translation.
2. Classify text as interface messages, authored/default content, stable protocol values or developer diagnostics. Confirm reachability before migrating legacy/duplicate UI.
3. Expand this package's seed namespace with reviewed semantic keys. Move related text into a complete sentence or plural message, and provide translator context.
4. Implement deferred references/render-time lookups in the owning consumer. Keep old string fallbacks during API migration and use the shared public runtime instance.
5. Test the module's actual behaviour, locale/profile switching, fallback and unchanged IIIF data. Mark inventory files reviewed and document exemptions rather than treating heuristic counts as completeness.

## Package source modules already implemented

| Source module | Responsibility | Remaining integration |
| --- | --- | --- |
| schema.ts | Plain catalog/resource/reference contracts and safe shapes | Promote public contract shapes through the public runtime without private declaration imports. |
| messages.ts and catalog-types.ts | Typed IDs, inferred interpolation values and serialisable references | Add references to definition contracts and resolve them in UI consumers. |
| validation.ts | Catalog syntax/placeholder/plural checks and strict namespace coverage | Add CI and deployment availability gates after runtime integration. |
| composition.ts | Immutable per-locale priority layers | Feed actual inherited preset/plugin/host layers from shell. |
| selection.ts | Host/preset restrictions, preference negotiation, direction and engine options | Wire persistence, SSR and the UI picker in host/runtime. |
| loaders.ts | Namespace ownership, lazy cache/retry, latest-load staging | Bridge lifecycle/subscriptions/errors into React; add optional cancellation if useful. |
| pseudo.ts | Long-text QA catalogs preserving syntax | Add visual/interaction QA in Storybook and Playwright. |
| catalogs.ts and catalog files | English seeds, partial plain profile and exhibition examples | Review and complete messages module by module; add real translated locales. |
| translation-files.ts and translator-notes.ts | Validated JSON exchange, safe TypeScript data generation and translator context | Extend notes with migrated messages and add profile/preset/platform exchange where needed. |

## Inventory maintenance

Run `npm run inventory` from this package to regenerate only `implementation/inventories`. Run `npm run inventory -- --check` to detect stale output without writing. The [inventory index](inventories/README.md) records source revision and counts; the original repository audit is a heuristic and omits MDX/JSON/CSS and dependency text.

Keep module task prose maintained separately from generated inventories. Test descriptions, fixture content and documentation prose are not automatically runtime catalog entries. The root workspace lockfile update and shared runtime publication are intentionally later tasks because this change was constrained to the new package.
