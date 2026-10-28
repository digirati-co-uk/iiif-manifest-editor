# Web host translation context

`web` owns launcher, browser import/project actions, local/share/external/example hosts,
settings, exhibition layout options, route feedback, legacy About/help and tutorial listing.
UI locale and wording are separate from the content-language fields in Settings.
`settings.defaultContentLanguage` and `settings.contentLanguages` explicitly name authored
content. Do not translate IDs, storage keys, filenames, protocol types or resource labels.

- Standard Dutch uses manifest, canvas/canvassen, collectie and tentoonstelling.
  Product/service/viewer names (Manifest Editor, Theseus, Digirati, Mirador, GitHub)
  keep their names. Recent is a Dutch cognate, reviewed for that exact tab source.
- `settings.standard` / `settings.plain` name independent wording profiles. Plain
  editor metadata/form terminology is supplied by the shared runtime overlays.
- `browser.loadingResource` inserts an untrusted URL as escaped text; `local.editingFile`
  inserts a filename; `local.lastModified` inserts a date formatted in the UI locale.
  Translate each complete message and keep its placeholder exactly.
- `tutorials.duration` combines a translated duration with the experience requirement.
  `tour.progress` uses Joyride's literal `{step}` and `{steps}` substitution syntax,
  rather than runtime `{{...}}` placeholders.
- `tutorials.firstNotebook` is a complete Markdown teaching document. Keep source URLs,
  JSON keys, dimensions, the painting protocol value and the explicit English exercise
  label unchanged. New tutorial copies resolve this message once on creation. Existing
  notebook Markdown is authored project content and must never change on a UI switch.
  Source recipe names are bibliographic titles. The notebook dependency's own commands
  remain an upstream gap; translating this document does not cover that product's UI.
- Example labels/descriptions, public/collection.json InternationalString maps and the
  standalone example specification's terminology/fixed metadata are authored fixtures.
  They are not host UI dictionaries. Technical API JSON error payloads are diagnostics;
  consuming UI shows translated friendly feedback.
