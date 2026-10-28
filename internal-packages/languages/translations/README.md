# Translator exchange files

Run `npm run translations:export` from this package to create ignored JSON review copies in `export/en-GB`, including the current translator notes. TypeScript source catalogs remain authoritative. Exported JSON must not be edited as a second permanent source.

To import a reviewed translation:

```sh
npm run translations:import -- --input /path/to/editors.fr.json --locale fr --namespace editors
```

The importer validates key ownership, placeholders, syntax, rich tags and the target locale's cardinal plural categories before writing a TypeScript file **inside this package**. It cannot overwrite source English. `--replace` deliberately replaces an existing target file; `--partial` permits fallback coverage but does not advertise that language as complete.

Importing a file does not make its locale selectable. Add explicit source exports, locale metadata, namespace loaders and reviewed coverage policy before enabling it. No real second-language translations have been supplied by this change.

These tools exchange base namespace catalogs only. Translate profile and preset-specific messages with their own context and validate them as overlays; do not import a merged preset/profile snapshot as a base language. Translator notes are seed context too and must expand alongside messages.
