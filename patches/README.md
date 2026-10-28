# Dependency translation patches

Workspace installs apply the entries in `pnpm-workspace.yaml` through pnpm's patch mechanism. Run installs with `--ignore-scripts`; no package rebuild is required to apply these shipped-JavaScript changes.

## @mdxeditor/editor 4.0.4

`@mdxeditor__editor@4.0.4.patch` connects malformed-source feedback to the existing editor `useTranslation` hook. The three keys are `diffSource.parseError`, `diffSource.recovery` and `diffSource.details`; the components adapter resolves them in its `mdx` catalog group. Original parser diagnostics remain verbatim under localized technical details. Parser behavior, stored Markdown and view mode are unchanged.

The actual rich-editor regression switches English/Dutch with malformed source and verifies the same error-details DOM, source value, diagnostic and callback counts. Keep this patch until an upstream version provides these translation calls, then remove it and rerun the test. This workspace patch applies to the hosted application and workspace builds; independently installed external SDK consumers need equivalent dependency support before claiming the same coverage. No upstream package was published or modified remotely.

When refreshing a patch, edit a separate extracted copy rather than pnpm's installed store, retain the upstream license, and inspect only the intended dependency diff. Register/apply it using pnpm, verify the patch hash with a frozen install, and run the affected tests. `pnpm patch-commit` unexpectedly ran this repository's `prepare` hook despite an environment-only ignore-scripts setting; explicit installs with `--ignore-scripts` did skip scripts. Avoid relying on that environment setting. No build or dev-server command was run.
