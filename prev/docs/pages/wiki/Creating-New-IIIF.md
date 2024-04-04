**File -> New** allows the creation of a blank Manifest; this loads a simple Manifest, the URL of which is included in configuration and by default is a Presentation 3 Manifest included with the Manifest Editor distribution.

The Cookbook IIIF Collection is also available in this Dialogue - unless removed in config.

[[Configuration]] allows adopters to provide additional templates for new Manifests. These are just links to HTTPS hosted Manifests, so you can provide them anywhere. You can also associate a template (or set of templates) with a configuration section, so you could load the Manifest Editor with `?configuration=single-image-guided-viewing` and not only would it get the UI settings appropriate to that (e.g., no thumbnail strip, no creation of additional canvases) but it would also show the config-specific set of templates in File -> New. If there is only one template available, File->New doesn't even offer the choice, you just get the Manifest straight away for editing.

This also sounds like something that would be useful for per-user config, stored in local storage.
As well as pre-canned templates under **File->New**, I also get any personal ones I've added.

The configuration can also associate a [[Preview]] mechanism with a template, so the Choice of template in File->New can alter the entries in the Preview menu. E.g., Choose the Ocean Liners template, get the Ocean Liners Preview.

Adopters should provide their own Manifest templates via config for the File -> New section, because they can include things that should be in all their Manifests, like `provider`, a default `rights` statement, a logo, and so on - this saves the institutional user a lot of time!

(note for config - `?configuration=single-image-guided-viewing` should probably set that in local storage (or wherever) and redirect?)