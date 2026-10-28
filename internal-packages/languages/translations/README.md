# Translator exchange files

Run `npm run translations:export` from this package to create ignored JSON review copies in `export/en-GB`, including the current translator notes. TypeScript source catalogs remain authoritative. Exported JSON must not be edited as a second permanent source.

To import a reviewed translation:

```sh
npm run translations:import -- --input /path/to/editors.fr.json --locale fr --namespace editors
```

The importer validates key ownership, placeholders, syntax, rich tags and the target locale's cardinal plural categories before writing a TypeScript file **inside this package**. It cannot overwrite source English. `--replace` deliberately replaces an existing target file; `--partial` permits fallback coverage but does not advertise that language as complete.

Importing a file does not make its locale selectable. Add explicit source exports, locale metadata, namespace loaders and reviewed coverage policy before enabling it. No real second-language translations have been supplied by this change.

These tools exchange base namespace catalogs only. Translate profile and preset-specific messages with their own context and validate them as overlays; do not import a merged preset/profile snapshot as a base language. Translator notes are seed context too and must expand alongside messages.

## Dutch coverage and terminology review

Run `npm run translations:check` to review Dutch base catalogs and all English-authored wording overlays against their Dutch files. Missing keys, invalid plurals/placeholders, incomplete overlays and unreviewed unchanged English fail the command. Use `-- --json` for a machine-readable report or `-- --locale <tag>` for another explicitly supplied target locale.

`unchanged-nl.json` records legitimate identical Dutch terminology per source file and message key. Each review includes the exact English text and a reason, so a later English edit invalidates the review. Terms such as Metadata, URL and singular canvas may correctly be unchanged; this is not permission to copy whole English catalogs. Unused reviews fail as well. Review new identical messages individually rather than approving a wildcard or entire namespace.

The check never merges fallback resources into its input. Passing it is catalog evidence; it does not prove that every UI caller has migrated or that every Dutch sentence has received linguistic review.
