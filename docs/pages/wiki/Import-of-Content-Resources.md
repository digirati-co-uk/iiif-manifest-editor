This is a component that offers one of more widgets (tabbed?) that allow selection of external content resources - that is, images for canvases - but also AV resources.

Out of the box the widgets are:

 - a variant of the [[IIIF Browser]] and will yield Content Resources extracted from external IIIF.
 - a plain "paste URL" that expects an image, or an image service, or a video file (and is clever about interrogating what it finds - potentially _very_ clever, e.g., a YouTube page). 

Later we might have a DLCS tab/widget, which allows you to browse the DLCS and ingest something new there and then.

If the user provides an image service, the Manifest Editor has all it needs to know. The DLCS plugin might immediately return the image service URL (even if it has yet to actually process it).

But if I import an image, the import dialog needs to return a public URL for that image, and possibly an image service:

**It is the import dialog’s responsibility to return an image resource - a content resource as might appear in a Manifest - to the ME, rather than just an image URL. Then the dialog can decide exactly what that looks like, what the image URL is, what the image service is, if one is being provided.**

**The import dialog (in Shell) adds the resource to Vault, constructing an `id/type` resource if necessary, and then returns the Vault reference. But it wouldn't add that image resource to the Vault-managed _Manifest_, that's something that the user will drive the App UI to do ... the Shell's import doesn't know where to put it!**

## Import from Desktop, or IIIF-ising of existing images

We can implement a DLCS plugin here and a [[GitHub Integration]] (that depends on the image being committed to a gh-pages branch, or picked up by some other process); other people can implement plugins for their own integrations. Is the GH plugin the same as the one used for loading and saving Manifests? Yes, but the user just needs to be aware of the gh-pages requirement. And if the image is picked up for transformation, the ME needs to know what it should put into the Manifest. The DLCS plugin has the same responsibility.

## Import behaviour

This is a design decision, explored in [User's mental model of the Canvas](https://github.com/digirati-co-uk/iiif-manifest-editor/discussions/29).
The key thing here is that *Import of Content Resources*, whether from File->Import or from icons in the Shell top bar, can be used to create a new Canvas and place that external resource on it, in one action. And that this is the usual course of events, because that's usually what people are doing - adding a new image to a sequence of images - the manifest.

## Recent

Here, Recent is not quite the same as in browsing for a manifest - it includes that, but it also has pure content (not presentation 3) sources - plain Image URLs, Image services.

## GitHub (NOTES WIP)

Maybe we do still have GH here because we can log in with GitHub and provide a direct upload for you to get an image from your desktop to a gh-pages location. This is a special case and is different from the regular browse manifest: needs to check that the image is web-servable - this is not necessarily the case with Save manifest to GitHub because you might not be serving your manifests from GH.
The GH integration is great for persistence generally, but by not depending on it for viewing, we don't require the branch you commit to to be a gh-pages branch. You can do what you like with GH, save your manifest there, part of some other workflow.
Similarly, people who integrate the ME with their CMS (like V&A) don't have to ensure that the saved manifest is web-servable immediately. Obviously at some point that manifest has to end up on the web (why are you editing it otherwise) but it doesn't have to be coupled to how it gets saved from the ME.

